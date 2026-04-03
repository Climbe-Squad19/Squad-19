package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.classes.Reuniao;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.ReuniaoResponse;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;

@Service
public class ReuniaoService {

    @Autowired
    private ReuniaoRepository reuniaoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ContratoRepository contratoRepository;

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
        reuniao.setLinkOnline(request.getLinkOnline());
        reuniao.setSala(request.getSala());
        reuniao.setParticipantesIds(request.getParticipantesIds());
        reuniao.setStatus(Reuniao.StatusReuniao.AGENDADA);
        reuniao.setDataCriacao(LocalDateTime.now());

        Reuniao salva = reuniaoRepository.save(reuniao);
        return converterParaResponse(salva);
    }

    @Transactional
    public ReuniaoResponse atualizar(Long id, ReuniaoAtualizacaoRequest request) {
        Reuniao reuniao = buscarEntidadePorId(id);

        reuniao.setPauta(request.getPauta());
        reuniao.setDataHora(request.getDataHora());
        reuniao.setPresencial(request.isPresencial());
        reuniao.setLinkOnline(request.getLinkOnline());
        reuniao.setSala(request.getSala());
        reuniao.setParticipantesIds(request.getParticipantesIds());

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
}