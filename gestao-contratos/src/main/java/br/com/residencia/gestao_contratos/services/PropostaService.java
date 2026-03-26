package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Proposta;
import br.com.residencia.gestao_contratos.repository.PropostaRepository;

@Service
public class PropostaService {

    @Autowired
    private PropostaRepository propostaRepository;

    @Autowired
    private ContratoService contratoService; 

    @Transactional
    public Proposta criarProposta(Proposta proposta) {
        proposta.setDataCriacao(LocalDateTime.now());
        proposta.setStatus(Proposta.StatusProposta.ELABORACAO);
        
        return propostaRepository.save(proposta);
    }

    @Transactional
    public Proposta atualizarStatus(Long id, Proposta.StatusProposta novoStatus, String motivoRecusa) {
        Proposta proposta = buscarPorId(id);
        
        proposta.setStatus(novoStatus);
        
        if (novoStatus == Proposta.StatusProposta.RECUSADA) {
            proposta.setMotivoRecusa(motivoRecusa);
        }

        Proposta propostaAtualizada = propostaRepository.save(proposta);

        if (novoStatus == Proposta.StatusProposta.ACEITA) {
            contratoService.gerarContratoAPartirDeProposta(propostaAtualizada);
        }

        return propostaAtualizada;
    }

    public Proposta buscarPorId(Long id) {
        return propostaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Proposta não encontrada."));
    }
}