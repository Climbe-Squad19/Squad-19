package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.classes.Proposta;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.request.ContratoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ContratoCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.ContratoResponse;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import br.com.residencia.gestao_contratos.repository.PropostaRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class ContratoService {

    @Autowired
    private ContratoRepository contratoRepository;

    @Autowired
    private PropostaRepository propostaRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // chamado pelo PropostaService quando proposta é aceita
    @Transactional
    public Contrato gerarContratoAPartirDeProposta(Proposta proposta) {
        Contrato contrato = new Contrato();
        contrato.setPropostaOrigem(proposta);
        contrato.setEmpresa(proposta.getEmpresa());
        contrato.setUsuarioResponsavel(proposta.getCriadoPor());
        contrato.setTipoServico(proposta.getServicoContratado());
        contrato.setStatus(Contrato.StatusContrato.ATIVO);
        contrato.setDataCriacao(LocalDateTime.now());
        return contratoRepository.save(contrato);
    }

    // criação manual de contrato
    @Transactional
    public ContratoResponse criar(ContratoCriacaoRequest request) {
        Proposta proposta = propostaRepository.findById(request.getPropostaOrigemId())
                .orElseThrow(() -> new RuntimeException("Proposta não encontrada"));

        Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        Usuario responsavel = usuarioRepository.findById(request.getUsuarioResponsavelId())
                .orElseThrow(() -> new RuntimeException("Usuário responsável não encontrado"));

        Contrato contrato = new Contrato();
        contrato.setPropostaOrigem(proposta);
        contrato.setEmpresa(empresa);
        contrato.setUsuarioResponsavel(responsavel);
        contrato.setTipoServico(proposta.getServicoContratado());
        contrato.setStatus(Contrato.StatusContrato.ATIVO);
        contrato.setDataInicio(request.getDataInicio());
        contrato.setDataFim(request.getDataFim());           // adicionado
        contrato.setLinkContratoAssinado(request.getLinkContratoAssinado());
        contrato.setRenovacaoAutomatica(request.isRenovacaoAutomatica());
        contrato.setDiasAvisoVencimento(request.getDiasAvisoVencimento());
        contrato.setObservacoes(request.getObservacoes());
        contrato.setDataCriacao(LocalDateTime.now());

        Contrato salvo = contratoRepository.save(contrato);
        return converterParaResponse(salvo);
    }

    @Transactional
    public ContratoResponse atualizar(Long id, ContratoAtualizacaoRequest request) {
        Contrato contrato = buscarEntidadePorId(id);

        contrato.setDataFim(request.getDataFim());
        contrato.setLinkContratoAssinado(request.getLinkContratoAssinado());
        contrato.setRenovacaoAutomatica(request.isRenovacaoAutomatica());
        contrato.setDiasAvisoVencimento(request.getDiasAvisoVencimento());
        contrato.setObservacoes(request.getObservacoes());

        if (request.getStatus() != null) {
            contrato.setStatus(Contrato.StatusContrato.valueOf(request.getStatus()));
        }

        Contrato atualizado = contratoRepository.save(contrato);
        return converterParaResponse(atualizado);
    }

    public List<ContratoResponse> listarTodos() {
        return contratoRepository.findAll().stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public ContratoResponse buscarPorId(Long id) {
        return converterParaResponse(buscarEntidadePorId(id));
    }

    @Transactional
    public void encerrar(Long id) {
        Contrato contrato = buscarEntidadePorId(id);
        contrato.setStatus(Contrato.StatusContrato.ENCERRADO);
        contratoRepository.save(contrato);
    }

    private Contrato buscarEntidadePorId(Long id) {
        return contratoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrato não encontrado"));
    }

    private ContratoResponse converterParaResponse(Contrato contrato) {
        ContratoResponse response = new ContratoResponse();
        response.setId(contrato.getId());
        response.setPropostaOrigemId(contrato.getPropostaOrigem() != null ?
                contrato.getPropostaOrigem().getId() : null);
        response.setEmpresaId(contrato.getEmpresa().getId());
        response.setNomeEmpresa(contrato.getEmpresa().getRazaoSocial());
        response.setTipoServico(contrato.getTipoServico());
        response.setStatus(contrato.getStatus() != null ?
                contrato.getStatus().name() : null);
        response.setDataInicio(contrato.getDataInicio());
        response.setDataFim(contrato.getDataFim());
        response.setDiasAvisoVencimento(contrato.getDiasAvisoVencimento());
        response.setLinkContratoAssinado(contrato.getLinkContratoAssinado());
        response.setRenovacaoAutomatica(contrato.isRenovacaoAutomatica());
        response.setObservacoes(contrato.getObservacoes());
        response.setDataCriacao(contrato.getDataCriacao());

        if (contrato.getUsuarioResponsavel() != null) {
            response.setUsuarioResponsavelId(contrato.getUsuarioResponsavel().getId());
            response.setNomeUsuarioResponsavel(
                    contrato.getUsuarioResponsavel().getNomeCompleto());
        }

        return response;
    }
}