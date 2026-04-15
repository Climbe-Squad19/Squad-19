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
import br.com.residencia.gestao_contratos.dtos.response.DashboardOverviewResponse;
import br.com.residencia.gestao_contratos.dtos.response.DashboardRecentContractResponse;
import br.com.residencia.gestao_contratos.dtos.response.DashboardUpcomingDueDateResponse;
import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.classes.DocumentoEmpresa;
import br.com.residencia.gestao_contratos.classes.Proposta;
import br.com.residencia.gestao_contratos.classes.Reuniao;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import br.com.residencia.gestao_contratos.repository.DocumentoEmpresaRepository;
import br.com.residencia.gestao_contratos.repository.PropostaRepository;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;

@Service
public class DashboardService {

    private final ReuniaoRepository reuniaoRepository;
    private final PropostaRepository propostaRepository;
    private final ContratoRepository contratoRepository;
    private final DocumentoEmpresaRepository documentoEmpresaRepository;

    public DashboardService(
            ReuniaoRepository reuniaoRepository,
            PropostaRepository propostaRepository,
            ContratoRepository contratoRepository,
            DocumentoEmpresaRepository documentoEmpresaRepository) {
        this.reuniaoRepository = reuniaoRepository;
        this.propostaRepository = propostaRepository;
        this.contratoRepository = contratoRepository;
        this.documentoEmpresaRepository = documentoEmpresaRepository;
    }

    public DashboardOverviewResponse obterVisaoGeral() {
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioSemana = hoje.atStartOfDay();
        LocalDateTime fimSemana = hoje.plusDays(7).atTime(LocalTime.MAX);

        long propostasPendentes = propostaRepository.countByStatusIn(List.of(
                Proposta.StatusProposta.ELABORACAO,
                Proposta.StatusProposta.ENVIADA));
        long contratosAtivos = contratoRepository.countByStatus(Contrato.StatusContrato.ATIVO);
        long documentosPendentes = documentoEmpresaRepository.countByStatus(DocumentoEmpresa.StatusDocumento.PENDENTE);
        long reunioesSemana = reuniaoRepository.countByDataHoraBetweenAndStatusNot(
                inicioSemana,
                fimSemana,
                Reuniao.StatusReuniao.CANCELADA);

        List<DashboardRecentContractResponse> ultimosContratos = contratoRepository.findTop5ByOrderByDataCriacaoDesc()
                .stream()
                .map(contrato -> new DashboardRecentContractResponse(
                        contrato.getEmpresa() != null ? contrato.getEmpresa().getRazaoSocial() : "Empresa",
                        contrato.getTipoServico(),
                        contrato.getDataCriacao()))
                .collect(Collectors.toList());

        List<DashboardUpcomingDueDateResponse> proximosVencimentos = contratoRepository
                .findTop10ByStatusAndDataFimGreaterThanEqualOrderByDataFimAsc(Contrato.StatusContrato.ATIVO, hoje)
                .stream()
                .map(contrato -> new DashboardUpcomingDueDateResponse(
                        contrato.getEmpresa() != null ? contrato.getEmpresa().getRazaoSocial() : "Empresa",
                        contrato.getTipoServico(),
                        contrato.getDataFim()))
                .collect(Collectors.toList());

        return new DashboardOverviewResponse(
                propostasPendentes,
                contratosAtivos,
                documentosPendentes,
                reunioesSemana,
                ultimosContratos,
                proximosVencimentos);
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
