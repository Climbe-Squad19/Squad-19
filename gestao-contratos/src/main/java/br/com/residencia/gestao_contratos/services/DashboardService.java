package br.com.residencia.gestao_contratos.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;

import br.com.residencia.gestao_contratos.dtos.response.AgendaEventResponse;
import br.com.residencia.gestao_contratos.dtos.response.CalendarDayResponse;
import br.com.residencia.gestao_contratos.classes.Reuniao;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;

@Service
public class DashboardService {

    private final ReuniaoRepository reuniaoRepository;

    public DashboardService(ReuniaoRepository reuniaoRepository) {
        this.reuniaoRepository = reuniaoRepository;
    }

    public List<AgendaEventResponse> obterAgendaDoDia(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return reuniaoRepository.findAll().stream()
                .filter(reuniao -> {
                    LocalDateTime dataHora = reuniao.getDataHora();
                    return dataHora != null && !dataHora.isBefore(startOfDay) && !dataHora.isAfter(endOfDay);
                })
                .sorted((a, b) -> a.getDataHora().compareTo(b.getDataHora()))
                .map(this::converterParaAgendaResponse)
                .collect(Collectors.toList());
    }

    public List<CalendarDayResponse> obterCalendarioDoMes(YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();

        LocalDateTime startOfMonth = start.atStartOfDay();
        LocalDateTime endOfMonth = end.atTime(LocalTime.MAX);

        Map<Integer, Long> eventosPorDia = reuniaoRepository.findAll().stream()
                .map(Reuniao::getDataHora)
                .filter(dataHora -> dataHora != null && !dataHora.isBefore(startOfMonth) && !dataHora.isAfter(endOfMonth))
                .collect(Collectors.groupingBy(LocalDateTime::getDayOfMonth, Collectors.counting()));

        return IntStream.rangeClosed(1, month.lengthOfMonth())
                .mapToObj(day -> new CalendarDayResponse(day,
                        eventosPorDia.getOrDefault(day, 0L),
                        eventosPorDia.containsKey(day)))
                .collect(Collectors.toList());
    }

    private AgendaEventResponse converterParaAgendaResponse(Reuniao reuniao) {
        AgendaEventResponse response = new AgendaEventResponse();
        response.setId(reuniao.getId());
        response.setTitle(reuniao.getPauta());
        response.setCompany(reuniao.getEmpresa().getRazaoSocial());
        response.setDateTime(reuniao.getDataHora());
        response.setTime(reuniao.getDataHora().toLocalTime().toString());
        response.setLocation(reuniao.isPresencial() ? reuniao.getSala() : reuniao.getLinkOnline());
        response.setPresencial(reuniao.isPresencial());
        response.setLinkOnline(reuniao.getLinkOnline());
        response.setStatus(reuniao.getStatus() != null ? reuniao.getStatus().name() : "");
        return response;
    }
}
