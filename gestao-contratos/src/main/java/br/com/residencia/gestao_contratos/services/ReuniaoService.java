package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Reuniao;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;

@Service
public class ReuniaoService {

    @Autowired
    private ReuniaoRepository reuniaoRepository;

    @Transactional
    public Reuniao agendarReuniao(Reuniao reuniao) {
        reuniao.setDataCriacao(LocalDateTime.now());
        reuniao.setStatus(Reuniao.StatusReuniao.AGENDADA);
        

        
        return reuniaoRepository.save(reuniao);
    }

    @Transactional
    public Reuniao atualizarStatus(Long id, Reuniao.StatusReuniao novoStatus) {
        Reuniao reuniao = buscarPorId(id);
        
        reuniao.setStatus(novoStatus);
                
        return reuniaoRepository.save(reuniao);
    }

    public Reuniao buscarPorId(Long id) {
        return reuniaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reunião não encontrada."));
    }
}