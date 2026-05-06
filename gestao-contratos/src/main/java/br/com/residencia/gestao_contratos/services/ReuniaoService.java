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
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.ReuniaoResponse;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class ReuniaoService {

    @Autowired
    private ReuniaoRepository reuniaoRepository;

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

    @Transactional
    public ReuniaoResponse agendar(ReuniaoCriacaoRequest request) {
        Empresa empresa = request.getEmpresaId() != null
                ? empresaRepository.findById(request.getEmpresaId()).orElse(null)
                : null;

        Contrato contrato = request.getContratoId() != null
                ? contratoRepository.findById(request.getContratoId()).orElse(null)
                : null;

        Reuniao reuniao = new Reuniao();
        reuniao.setPauta(request.getPauta());
        if (empresa != null) reuniao.setEmpresa(empresa);
        if (contrato != null) reuniao.setContrato(contrato);
        reuniao.setTipo(request.getTipo() != null ? request.getTipo() : Reuniao.TipoReuniao.INICIAL);
        reuniao.setDataHora(request.getDataHora());
        reuniao.setPresencial(request.isPresencial());
        reuniao.setSala(request.getSala());
        reuniao.setParticipantesIds(request.getParticipantesIds());
        reuniao.setStatus(Reuniao.StatusReuniao.AGENDADA);
        reuniao.setDataCriacao(LocalDateTime.now());

        String linkFrontend = request.getLinkOnline();
        if (linkFrontend != null && !linkFrontend.isBlank()
                && (linkFrontend.startsWith("https://meet.google.com/")
                || linkFrontend.startsWith("https://zoom.us/")
                || linkFrontend.startsWith("https://teams.microsoft.com/"))) {
            reuniao.setLinkOnline(linkFrontend);
        }

        Reuniao salva = reuniaoRepository.save(reuniao);

        try {
            String meetLink = googleCalendarService.criarEventoParaUsuarioLogado(salva);
            if (meetLink != null) {
                salva.setLinkOnline(meetLink);
                salva = reuniaoRepository.save(salva);
            }
        } catch (Exception ignored) {
        }

        enviarNotificacaoAgendamento(salva);
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

    public ReuniaoResponse buscarPorId(Long id) {
        return converterParaResponse(buscarEntidadePorId(id));
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

    private ReuniaoResponse converterParaResponse(Reuniao reuniao) {
        ReuniaoResponse response = new ReuniaoResponse();
        response.setId(reuniao.getId());
        response.setTipo(reuniao.getTipo());
        response.setPauta(reuniao.getPauta());
        response.setEmpresaId(reuniao.getEmpresa() != null ? reuniao.getEmpresa().getId() : null);
        response.setNomeEmpresa(reuniao.getEmpresa() != null ? reuniao.getEmpresa().getRazaoSocial() : null);
        response.setContratoId(reuniao.getContrato() != null ? reuniao.getContrato().getId() : null);
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

            if (reuniao.getEmpresa() != null
                    && reuniao.getEmpresa().getEmailContato() != null
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

            usuarioRepository.findAll().stream()
                    .filter(u -> u.isAtivo()
                            && u.getSituacao() == Usuario.SituacaoUsuario.ATIVO
                            && u.getEmail() != null
                            && !u.getEmail().isBlank())
                    .map(Usuario::getEmail)
                    .forEach(destinatarios::add);

            String assunto = "Nova reunião agendada - " + reuniao.getPauta();
            String conteudo = "Uma nova reunião foi agendada no sistema Climbe:\n\n"
                    + "Pauta: " + reuniao.getPauta() + "\n"
                    + "Empresa: " + (reuniao.getEmpresa() != null
                        ? reuniao.getEmpresa().getRazaoSocial() : "Não informada") + "\n"
                    + "Data/Hora: " + reuniao.getDataHora() + "\n"
                    + "Modalidade: " + (reuniao.isPresencial() ? "Presencial" : "Online") + "\n"
                    + (reuniao.isPresencial()
                        ? "Sala: " + reuniao.getSala()
                        : "Link: " + (reuniao.getLinkOnline() != null
                            ? reuniao.getLinkOnline()
                            : "Será gerado em breve")) + "\n";

            destinatarios.forEach(destinatario ->
                    emailService.enviarEmail(destinatario, assunto, conteudo));
        } catch (Exception ignored) {
        }
    }
}
