package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.classes.Reuniao;
import br.com.residencia.gestao_contratos.classes.ReuniaoGravacao;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.MeetInsightsResponse;
import br.com.residencia.gestao_contratos.dtos.response.MeetRecordingItemResponse;
import br.com.residencia.gestao_contratos.dtos.response.ReuniaoGravacaoResponse;
import br.com.residencia.gestao_contratos.dtos.response.ReuniaoResponse;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import br.com.residencia.gestao_contratos.repository.ReuniaoGravacaoRepository;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class ReuniaoService {

    @Autowired
    private ReuniaoRepository reuniaoRepository;

    @Autowired
    private ReuniaoGravacaoRepository reuniaoGravacaoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ContratoRepository contratoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    @Autowired
    private GoogleMeetInsightsService googleMeetInsightsService;

    @Transactional
    public ReuniaoResponse agendar(ReuniaoCriacaoRequest request) {
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        Contrato contrato = contratoRepository.findById(request.getContratoId())
                .orElseThrow(() -> new RuntimeException("Contrato não encontrado"));

        Reuniao reuniao = new Reuniao();
        reuniao.setPauta(request.getPauta());
        reuniao.setEmpresa(empresa);
        reuniao.setContrato(contrato);
        reuniao.setTipo(request.getTipo());
        reuniao.setDataHora(request.getDataHora());
        reuniao.setPresencial(request.isPresencial());
        reuniao.setSala(request.getSala());
        reuniao.setParticipantesIds(request.getParticipantesIds());
        reuniao.setStatus(Reuniao.StatusReuniao.AGENDADA);
        reuniao.setDataCriacao(LocalDateTime.now());

        // Só aceita link do frontend se for URL real conhecida
        String linkFrontend = request.getLinkOnline();
        if (linkFrontend != null && !linkFrontend.isBlank()
                && (linkFrontend.startsWith("https://meet.google.com/")
                || linkFrontend.startsWith("https://zoom.us/")
                || linkFrontend.startsWith("https://teams.microsoft.com/"))) {
            reuniao.setLinkOnline(linkFrontend);
        }

        Reuniao salva = reuniaoRepository.save(reuniao);
        enviarNotificacaoAgendamento(salva);

        try {
            String meetLink = googleCalendarService.criarEventoParaUsuarioLogado(salva);
            if (meetLink != null) {
                salva.setLinkOnline(meetLink);
                reuniaoRepository.save(salva);
            }
        } catch (Exception ignored) {
            // Calendar é opcional; não deve bloquear o agendamento.
        }

        return converterParaResponse(salva);
    }

    @Transactional
    public ReuniaoResponse atualizar(Long id, ReuniaoAtualizacaoRequest request) {
        Reuniao reuniao = buscarEntidadePorId(id);

        reuniao.setPauta(request.getPauta());
        reuniao.setDataHora(request.getDataHora());
        reuniao.setPresencial(request.isPresencial());
        reuniao.setSala(request.getSala());
        reuniao.setParticipantesIds(request.getParticipantesIds());

        // Mesmo critério para atualização
        String linkFrontend = request.getLinkOnline();
        if (linkFrontend != null && !linkFrontend.isBlank()
                && (linkFrontend.startsWith("https://meet.google.com/")
                || linkFrontend.startsWith("https://zoom.us/")
                || linkFrontend.startsWith("https://teams.microsoft.com/"))) {
            reuniao.setLinkOnline(linkFrontend);
        }

        if (request.getStatus() != null) {
            reuniao.setStatus(Reuniao.StatusReuniao.valueOf(request.getStatus()));
        }

        Reuniao atualizada = reuniaoRepository.save(reuniao);
        return converterParaResponse(atualizada);
    }

    public List<ReuniaoResponse> listarTodos() {
        return reuniaoRepository.findAll().stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public List<ReuniaoResponse> listarPorEmpresa(Long empresaId) {
        return reuniaoRepository.findByEmpresaId(empresaId).stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public ReuniaoResponse buscarPorId(Long id) {
        return converterParaResponse(buscarEntidadePorId(id));
    }

    public MeetInsightsResponse obterInsightsMeet(Long id) {
        Reuniao reuniao = buscarEntidadePorId(id);
        validarReuniaoGoogleMeet(reuniao);
        return googleMeetInsightsService.obterInsightsDoMeet(reuniao.getLinkOnline());
    }

    @Transactional
    public List<ReuniaoGravacaoResponse> sincronizarGravacoesMeet(Long id) {
        Reuniao reuniao = buscarEntidadePorId(id);
        validarReuniaoGoogleMeet(reuniao);

        MeetInsightsResponse insights = googleMeetInsightsService.obterInsightsDoMeet(reuniao.getLinkOnline());
        LocalDateTime agora = LocalDateTime.now();

        for (MeetRecordingItemResponse item : insights.getGravacoes()) {
            if (item.getNome() == null || item.getNome().isBlank()) {
                continue;
            }

            ReuniaoGravacao gravacao = reuniaoGravacaoRepository.findByRecordingName(item.getNome())
                    .orElseGet(ReuniaoGravacao::new);
            gravacao.setReuniao(reuniao);
            gravacao.setMeetingCode(insights.getMeetingCode());
            gravacao.setRecordingName(item.getNome());
            gravacao.setEstado(item.getEstado());
            gravacao.setDriveFile(item.getArquivoDrive());
            gravacao.setUrl(item.getUrl());
            gravacao.setUltimaSincronizacao(agora);

            reuniaoGravacaoRepository.save(gravacao);
        }

        return listarGravacoesMeet(id);
    }

    @Transactional
    public int sincronizarGravacoesMeetEmLote(int diasRetroativos) {
        LocalDateTime limite = LocalDateTime.now().minusDays(Math.max(diasRetroativos, 1));
        int reunioesAtualizadas = 0;

        List<Reuniao> candidatas = reuniaoRepository.findAll().stream()
                .filter(reuniao -> !reuniao.isPresencial())
                .filter(reuniao -> reuniao.getLinkOnline() != null && reuniao.getLinkOnline().contains("meet.google.com"))
                .filter(reuniao -> reuniao.getDataHora() != null && reuniao.getDataHora().isAfter(limite))
                .toList();

        for (Reuniao reuniao : candidatas) {
            try {
                List<ReuniaoGravacaoResponse> gravacoes = sincronizarGravacoesMeet(reuniao.getId());
                if (!gravacoes.isEmpty()) {
                    reunioesAtualizadas++;
                }
            } catch (RuntimeException ex) {
                // Falha em uma reunião não deve interromper o lote completo.
            }
        }

        return reunioesAtualizadas;
    }

    public List<ReuniaoGravacaoResponse> listarGravacoesMeet(Long id) {
        buscarEntidadePorId(id);
        return reuniaoGravacaoRepository.findByReuniaoIdOrderByUltimaSincronizacaoDesc(id).stream()
                .map(this::converterGravacaoParaResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelar(Long id) {
        Reuniao reuniao = buscarEntidadePorId(id);
        reuniao.setStatus(Reuniao.StatusReuniao.CANCELADA);
        reuniaoRepository.save(reuniao);
    }

    private Reuniao buscarEntidadePorId(Long id) {
        return reuniaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reunião não encontrada"));
    }

    private void validarReuniaoGoogleMeet(Reuniao reuniao) {
        if (reuniao.isPresencial()) {
            throw new IllegalArgumentException("A reunião informada é presencial e não possui dados de Meet");
        }

        if (reuniao.getLinkOnline() == null || reuniao.getLinkOnline().isBlank()) {
            throw new IllegalArgumentException("A reunião não possui link online");
        }

        if (!reuniao.getLinkOnline().contains("meet.google.com")) {
            throw new IllegalArgumentException("A reunião não está vinculada a um Google Meet");
        }
    }

    private ReuniaoGravacaoResponse converterGravacaoParaResponse(ReuniaoGravacao gravacao) {
        return new ReuniaoGravacaoResponse(
                gravacao.getId(),
                gravacao.getReuniao().getId(),
                gravacao.getMeetingCode(),
                gravacao.getRecordingName(),
                gravacao.getEstado(),
                gravacao.getDriveFile(),
                gravacao.getUrl(),
                gravacao.getUltimaSincronizacao());
    }

    private ReuniaoResponse converterParaResponse(Reuniao reuniao) {
        ReuniaoResponse response = new ReuniaoResponse();
        response.setId(reuniao.getId());
        response.setTipo(reuniao.getTipo());
        response.setPauta(reuniao.getPauta());
        response.setEmpresaId(reuniao.getEmpresa().getId());
        response.setNomeEmpresa(reuniao.getEmpresa().getRazaoSocial());
        response.setContratoId(reuniao.getContrato().getId());
        response.setDataHora(reuniao.getDataHora());
        response.setPresencial(reuniao.isPresencial());
        response.setLinkOnline(reuniao.getLinkOnline());
        response.setSala(reuniao.getSala());
        response.setStatus(reuniao.getStatus() != null ?
                reuniao.getStatus().name() : null);
        response.setParticipantesIds(reuniao.getParticipantesIds());
        response.setDataCriacao(reuniao.getDataCriacao());
        return response;
    }

    private void enviarNotificacaoAgendamento(Reuniao reuniao) {
        try {
            Set<String> destinatarios = new LinkedHashSet<>();

            if (reuniao.getEmpresa().getEmailContato() != null
                    && !reuniao.getEmpresa().getEmailContato().isBlank()) {
                destinatarios.add(reuniao.getEmpresa().getEmailContato());
            }

            List<Long> participantes = reuniao.getParticipantesIds() != null
                    ? reuniao.getParticipantesIds()
                    : new ArrayList<>();

            if (!participantes.isEmpty()) {
                List<Usuario> usuarios = usuarioRepository.findAllById(participantes);
                destinatarios.addAll(
                        usuarios.stream()
                                .map(Usuario::getEmail)
                                .filter(email -> email != null && !email.isBlank())
                                .toList());
            }

            String assunto = "Nova reunião agendada - " + reuniao.getPauta();
            String conteudo = "A reunião foi agendada com os seguintes dados:\n\n"
                    + "Pauta: " + reuniao.getPauta() + "\n"
                    + "Empresa: " + reuniao.getEmpresa().getRazaoSocial() + "\n"
                    + "Data/Hora: " + reuniao.getDataHora() + "\n"
                    + "Modalidade: " + (reuniao.isPresencial() ? "Presencial" : "Online") + "\n"
                    + (reuniao.isPresencial()
                        ? "Sala: " + reuniao.getSala()
                        : "Link: " + reuniao.getLinkOnline()) + "\n";

            destinatarios.forEach(destinatario ->
                    emailService.enviarEmail(destinatario, assunto, conteudo));
        } catch (Exception ignored) {
            // Email não deve interromper o agendamento da reunião.
        }
    }
}
