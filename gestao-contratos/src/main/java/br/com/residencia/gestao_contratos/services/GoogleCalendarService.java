package br.com.residencia.gestao_contratos.services;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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

    private static final String CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

    private final WebClient webClient;
    private final GoogleOAuthTokenService googleOAuthTokenService;
    private final ZoneId calendarZoneId;

    public GoogleCalendarService(
            WebClient.Builder webClientBuilder,
            GoogleOAuthTokenService googleOAuthTokenService,
            @Value("${app.integrations.google.calendar-timezone:America/Sao_Paulo}") String calendarTimezone) {
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

    public void criarEventoParaUsuarioLogado(Reuniao reuniao) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return;
        }

        Optional<String> accessToken = googleOAuthTokenService.getValidAccessTokenForUserEmail(
                authentication.getName(),
                IntegracaoOAuthToken.ProvedorIntegracao.GOOGLECALENDAR);
        if (accessToken.isEmpty()) {
            return;
        }

        String startDateTime = reuniao.getDataHora().atZone(calendarZoneId)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String endDateTime = reuniao.getDataHora().plusHours(1).atZone(calendarZoneId)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String location = reuniao.isPresencial() ? reuniao.getSala() : reuniao.getLinkOnline();
        String descricao = "Reunião agendada via Climbe.\nEmpresa: "
                + (reuniao.getEmpresa() != null ? reuniao.getEmpresa().getRazaoSocial() : "N/A");

        Map<String, Object> payload = Map.of(
                "summary", reuniao.getPauta() == null ? "Reunião" : reuniao.getPauta(),
                "description", descricao,
                "location", location == null ? "" : location,
                "start", Map.of("dateTime", startDateTime),
                "end", Map.of("dateTime", endDateTime));

        webClient.post()
                .uri(CALENDAR_EVENTS_URL)
                .headers(headers -> headers.setBearerAuth(accessToken.get()))
                .bodyValue(payload)
                .retrieve()
                .toBodilessEntity()
                .block();
    }
}
