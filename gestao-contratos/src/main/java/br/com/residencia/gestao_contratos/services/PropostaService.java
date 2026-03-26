package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.classes.Proposta;
import br.com.residencia.gestao_contratos.dtos.request.PropostaAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.PropostaCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.PropostaResponse;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import br.com.residencia.gestao_contratos.repository.PropostaRepository;

@Service
public class PropostaService {

    @Autowired
    private PropostaRepository propostaRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ContratoService contratoService;

    @Transactional
    public PropostaResponse criar(PropostaCriacaoRequest request) {
        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        Proposta proposta = new Proposta();
        proposta.setEmpresa(empresa);
        proposta.setServicoContratado(request.getServicoContratado());
        proposta.setValorMensal(request.getValorMensal());
        proposta.setValorSetup(request.getValorSetup());
        proposta.setDataEmissao(request.getDataEmissao());
        proposta.setLinkGoogleDrive(request.getLinkGoogleDrive());
        proposta.setStatus(Proposta.StatusProposta.ELABORACAO);
        proposta.setDataCriacao(LocalDateTime.now());

        Proposta salva = propostaRepository.save(proposta);
        return converterParaResponse(salva);
    }

    @Transactional
    public PropostaResponse atualizar(Long id, PropostaAtualizacaoRequest request) {
        Proposta proposta = buscarEntidadePorId(id);

        proposta.setServicoContratado(request.getServicoContratado());
        proposta.setValorMensal(request.getValorMensal());
        proposta.setValorSetup(request.getValorSetup());
        proposta.setLinkGoogleDrive(request.getLinkGoogleDrive());

        Proposta atualizada = propostaRepository.save(proposta);
        return converterParaResponse(atualizada);
    }

    @Transactional
    public PropostaResponse atualizarStatus(Long id, Proposta.StatusProposta novoStatus,
            String motivoRecusa) {
        Proposta proposta = buscarEntidadePorId(id);

        proposta.setStatus(novoStatus);

        if (novoStatus == Proposta.StatusProposta.RECUSADA) {
            if (motivoRecusa == null || motivoRecusa.isEmpty())
                throw new RuntimeException("Motivo de recusa obrigatório");
            proposta.setMotivoRecusa(motivoRecusa);
        }

        Proposta atualizada = propostaRepository.save(proposta);

        if (novoStatus == Proposta.StatusProposta.ACEITA) {
            contratoService.gerarContratoAPartirDeProposta(atualizada);
        }

        return converterParaResponse(atualizada);
    }

    public List<PropostaResponse> listarTodos() {
        return propostaRepository.findAll().stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public PropostaResponse buscarPorId(Long id) {
        return converterParaResponse(buscarEntidadePorId(id));
    }

    public void inativar(Long id) {
        Proposta proposta = buscarEntidadePorId(id);
        proposta.setStatus(Proposta.StatusProposta.RECUSADA);
        propostaRepository.save(proposta);
    }

    private Proposta buscarEntidadePorId(Long id) {
        return propostaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposta não encontrada"));
    }

    private PropostaResponse converterParaResponse(Proposta proposta) {
        PropostaResponse response = new PropostaResponse();
        response.setId(proposta.getId());
        response.setEmpresaId(proposta.getEmpresa().getId());
        response.setNomeEmpresa(proposta.getEmpresa().getRazaoSocial());
        response.setServicoContratado(proposta.getServicoContratado());
        response.setValorMensal(proposta.getValorMensal());
        response.setValorSetup(proposta.getValorSetup());
        response.setDataEmissao(proposta.getDataEmissao());
        response.setLinkGoogleDrive(proposta.getLinkGoogleDrive());
        response.setStatus(proposta.getStatus() != null ?
                proposta.getStatus().name() : null);
        response.setMotivoRecusa(proposta.getMotivoRecusa());
        response.setDataCriacao(proposta.getDataCriacao());

        if (proposta.getCriadoPor() != null) {
            response.setCriadoPorId(proposta.getCriadoPor().getId());
            response.setNomeCriadoPor(proposta.getCriadoPor().getNomeCompleto());
        }

        return response;
    }
}