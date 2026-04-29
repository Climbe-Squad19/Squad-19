package br.com.residencia.gestao_contratos.services;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.residencia.gestao_contratos.classes.IntegracaoOAuthToken;
import br.com.residencia.gestao_contratos.classes.Reuniao;

@Service
public class GoogleCalendarService {

    private static final String CALENDAR_EVENTS_URL =
            "https://www.googleapis.com/calendar/v3/calendars/primary/events";

    private final WebClient webClient;
    private final GoogleOAuthTokenService googleOAuthTokenService;
    private final ZoneId calendarZoneId;

    public GoogleCalendarService(
            WebClient.Builder webClientBuilder,
            GoogleOAuthTokenService googleOAuthTokenService,
            @Value("${app.integrations.google.calendar-timezone:America/Sao_Paulo}")
            String calendarTimezone) {
        this.webClient = webClientBuilder.build();
        this.googleOAuthTokenService = googleOAuthTokenService;
        ZoneId zoneId;
        try {
            zoneId = ZoneId.of(calendarTimezone);
        } catch (Exception ex) {
            zoneId = ZoneId.systemDefault();
        }
        this.calendarZoneId = zoneId;
    }

    public String criarEventoParaUsuarioLogado(Reuniao reuniao) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null
                || authentication.getName().isBlank()) {
            return null;
        }

        Optional<String> accessToken = googleOAuthTokenService.getValidAccessTokenForUserEmail(
                authentication.getName(),
                IntegracaoOAuthToken.ProvedorIntegracao.GOOGLECALENDAR);
        if (accessToken.isEmpty()) {
            return null;
        }

        String startDateTime = reuniao.getDataHora().atZone(calendarZoneId)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String endDateTime = reuniao.getDataHora().plusHours(1).atZone(calendarZoneId)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String location = reuniao.isPresencial() ? reuniao.getSala() : reuniao.getLinkOnline();
        String descricao = "Reunião agendada via Climbe.\nEmpresa: "
                + (reuniao.getEmpresa() != null ? reuniao.getEmpresa().getRazaoSocial() : "N/A");

        String requestId = "climbe-" + System.currentTimeMillis();

        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("summary", reuniao.getPauta() == null ? "Reunião" : reuniao.getPauta());
        payload.put("description", descricao);
        payload.put("location", location == null ? "" : location);
        payload.put("start", Map.of("dateTime", startDateTime));
        payload.put("end", Map.of("dateTime", endDateTime));

        if (!reuniao.isPresencial()) {
            payload.put("conferenceData", Map.of(
                "createRequest", Map.of(
                    "requestId", requestId,
                    "conferenceSolutionKey", Map.of("type", "hangoutsMeet")
                )
            ));
        }

        Map response;
        try {
            response = webClient.post()
                    .uri(CALENDAR_EVENTS_URL + "?conferenceDataVersion=1")
                    .headers(headers -> headers.setBearerAuth(accessToken.get()))
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            return null;
        }

        if (response != null && response.containsKey("conferenceData")) {
            Map conferenceData = (Map) response.get("conferenceData");
            if (conferenceData.containsKey("entryPoints")) {
                List entryPoints = (List) conferenceData.get("entryPoints");
                for (Object ep : entryPoints) {
                    Map entryPoint = (Map) ep;
                    if ("video".equals(entryPoint.get("entryPointType"))) {
                        return (String) entryPoint.get("uri");
                    }
                }
            }
        }
        return null;
    }
}
