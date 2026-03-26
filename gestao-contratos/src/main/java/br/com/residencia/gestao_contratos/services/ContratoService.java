package br.com.residencia.gestao_contratos.services;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.classes.Proposta;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;

@Service
public class ContratoService {

    @Autowired
    private ContratoRepository contratoRepository;

    @Transactional
    public Contrato gerarContratoAPartirDeProposta(Proposta proposta) {
        Contrato novoContrato = new Contrato();
        
        novoContrato.setPropostaOrigem(proposta);
        novoContrato.setEmpresa(proposta.getEmpresa());
        novoContrato.setUsuarioResponsavel(proposta.getCriadoPor());
        novoContrato.setTipoServico(proposta.getServicoContratado());
        
        novoContrato.setStatus(Contrato.StatusContrato.ATIVO);
        novoContrato.setDataCriacao(LocalDateTime.now());
        
        novoContrato.setDataInicio(LocalDate.now());
                
        return contratoRepository.save(novoContrato);
    }

    public Contrato buscarPorId(Long id) {
        return contratoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contrato não encontrado."));
    }
}