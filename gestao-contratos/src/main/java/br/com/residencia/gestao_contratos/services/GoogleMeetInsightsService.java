package br.com.residencia.gestao_contratos.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.residencia.gestao_contratos.classes.IntegracaoOAuthToken;
import br.com.residencia.gestao_contratos.dtos.response.MeetInsightsResponse;
import br.com.residencia.gestao_contratos.dtos.response.MeetRecordingItemResponse;

@Service
public class GoogleMeetInsightsService {

    private static final String MEET_CONFERENCE_RECORDS_URL =
            "https://meet.googleapis.com/v2/conferenceRecords";

    private static final Pattern MEET_CODE_PATTERN =
            Pattern.compile("([a-z]{3}-[a-z]{4}-[a-z]{3})", Pattern.CASE_INSENSITIVE);

    private final WebClient webClient;
    private final GoogleOAuthTokenService googleOAuthTokenService;

    public GoogleMeetInsightsService(
            WebClient.Builder webClientBuilder,
            GoogleOAuthTokenService googleOAuthTokenService) {
        this.webClient = webClientBuilder.build();
        this.googleOAuthTokenService = googleOAuthTokenService;
    }

    public MeetInsightsResponse obterInsightsDoMeet(String meetUrl) {
        String meetingCode = extrairMeetingCode(meetUrl);
        if (meetingCode == null) {
            throw new IllegalArgumentException("Link do Google Meet inválido");
        }

        String userEmail = obterEmailUsuarioLogado();
        Optional<String> accessToken = googleOAuthTokenService.getValidAccessTokenForUserEmail(
                userEmail,
                IntegracaoOAuthToken.ProvedorIntegracao.GOOGLEMEET);

        if (accessToken.isEmpty()) {
            throw new RuntimeException("Integração Google Meet não conectada para o usuário logado");
        }

        Map<String, Object> conferenceRecord = buscarConferenceRecordMaisRecente(
                accessToken.get(),
                meetingCode);

        if (conferenceRecord == null || conferenceRecord.get("name") == null) {
            return MeetInsightsResponse.semDados(meetingCode);
        }

        String conferenceRecordName = String.valueOf(conferenceRecord.get("name"));

        OffsetDateTime startTime = parseDateTime(conferenceRecord.get("startTime"));
        OffsetDateTime endTime = parseDateTime(conferenceRecord.get("endTime"));
        Long duracaoMinutos = null;
        if (startTime != null && endTime != null && !endTime.isBefore(startTime)) {
            duracaoMinutos = Duration.between(startTime, endTime).toMinutes();
        }

        int participantes = contarParticipantes(accessToken.get(), conferenceRecordName);
        List<MeetRecordingItemResponse> gravacoes = listarGravacoes(accessToken.get(), conferenceRecordName);

        return new MeetInsightsResponse(
                meetingCode,
                participantes,
                duracaoMinutos,
                !gravacoes.isEmpty(),
                gravacoes);
    }

    private Map<String, Object> buscarConferenceRecordMaisRecente(String accessToken, String meetingCode) {
        String filter = "space.meeting_code=\"" + meetingCode + "\"";
        String encodedFilter = URLEncoder.encode(filter, StandardCharsets.UTF_8);
        Map<String, Object> response;
        try {
            response = webClient.get()
                    .uri(MEET_CONFERENCE_RECORDS_URL + "?filter=" + encodedFilter)
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception ex) {
            throw new RuntimeException("Falha ao consultar registros do Google Meet", ex);
        }

        if (response == null || response.get("conferenceRecords") == null) {
            return null;
        }

        List<Map<String, Object>> records = (List<Map<String, Object>>) response.get("conferenceRecords");
        if (records == null || records.isEmpty()) {
            return null;
        }

        return records.stream()
                .max(Comparator.comparing(this::timestampRelevante))
                .orElse(null);
    }

    private int contarParticipantes(String accessToken, String conferenceRecordName) {
        int total = 0;
        String pageToken = null;

        do {
            String uri = "https://meet.googleapis.com/v2/" + conferenceRecordName + "/participants?pageSize=200";
            if (pageToken != null && !pageToken.isBlank()) {
                uri += "&pageToken=" + pageToken;
            }

            Map<String, Object> response = webClient.get()
                    .uri(uri)
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                break;
            }

            List<Map<String, Object>> participants = (List<Map<String, Object>>) response.get("participants");
            if (participants != null) {
                total += participants.size();
            }

            pageToken = response.get("nextPageToken") != null
                    ? String.valueOf(response.get("nextPageToken"))
                    : null;
        } while (pageToken != null && !pageToken.isBlank());

        return total;
    }

    private List<MeetRecordingItemResponse> listarGravacoes(String accessToken, String conferenceRecordName) {
        List<MeetRecordingItemResponse> gravacoes = new ArrayList<>();
        String pageToken = null;

        do {
            String uri = "https://meet.googleapis.com/v2/" + conferenceRecordName + "/recordings?pageSize=200";
            if (pageToken != null && !pageToken.isBlank()) {
                uri += "&pageToken=" + pageToken;
            }

            Map<String, Object> response = webClient.get()
                    .uri(uri)
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                break;
            }

            List<Map<String, Object>> recordings = (List<Map<String, Object>>) response.get("recordings");
            if (recordings != null) {
                for (Map<String, Object> recording : recordings) {
                    Map<String, Object> driveDestination = (Map<String, Object>) recording.get("driveDestination");
                    String arquivoDrive = driveDestination != null && driveDestination.get("file") != null
                            ? String.valueOf(driveDestination.get("file"))
                            : null;
                    String exportUri = driveDestination != null && driveDestination.get("exportUri") != null
                            ? String.valueOf(driveDestination.get("exportUri"))
                            : null;
                    gravacoes.add(new MeetRecordingItemResponse(
                            recording.get("name") != null ? String.valueOf(recording.get("name")) : null,
                            recording.get("state") != null ? String.valueOf(recording.get("state")) : null,
                            arquivoDrive,
                            exportUri));
                }
            }

            pageToken = response.get("nextPageToken") != null
                    ? String.valueOf(response.get("nextPageToken"))
                    : null;
        } while (pageToken != null && !pageToken.isBlank());

        return gravacoes;
    }

    private String extrairMeetingCode(String meetUrl) {
        if (meetUrl == null || meetUrl.isBlank()) {
            return null;
        }
        Matcher matcher = MEET_CODE_PATTERN.matcher(meetUrl);
        if (!matcher.find()) {
            return null;
        }
        return matcher.group(1).toLowerCase();
    }

    private String obterEmailUsuarioLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new RuntimeException("Usuário não autenticado para consultar dados do Meet");
        }
        return authentication.getName();
    }

    private OffsetDateTime parseDateTime(Object raw) {
        if (raw == null) {
            return null;
        }
        try {
            return OffsetDateTime.parse(String.valueOf(raw));
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private OffsetDateTime timestampRelevante(Map<String, Object> record) {
        OffsetDateTime end = parseDateTime(record.get("endTime"));
        if (end != null) {
            return end;
        }
        OffsetDateTime start = parseDateTime(record.get("startTime"));
        return start != null ? start : OffsetDateTime.MIN;
    }
}
