package br.com.residencia.gestao_contratos.controller;

import br.com.residencia.gestao_contratos.classes.Reuniao;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/reunioes")
public class ReuniaoController {

    private final ReuniaoRepository reuniaoRepository;

    public ReuniaoController(ReuniaoRepository reuniaoRepository) {
        this.reuniaoRepository = reuniaoRepository;
    }

    @GetMapping
    public List<Reuniao> getAll() {
        return reuniaoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reuniao> getById(@PathVariable Long id) {
        return reuniaoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reuniao nao encontrada"));
    }

    @PostMapping
    public ResponseEntity<Reuniao> create(@RequestBody Reuniao reuniao) {
        Reuniao saved = reuniaoRepository.save(reuniao);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reuniao> update(@PathVariable Long id, @RequestBody Reuniao reuniao) {
        Reuniao existing = reuniaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reuniao nao encontrada"));

        existing.setPauta(reuniao.getPauta());
        existing.setEmpresa(reuniao.getEmpresa());
        existing.setDataHora(reuniao.getDataHora());
        existing.setPresencial(reuniao.isPresencial());
        existing.setLinkOnline(reuniao.getLinkOnline());
        existing.setSala(reuniao.getSala());

        Reuniao updated = reuniaoRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Reuniao existing = reuniaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reuniao nao encontrada"));

        reuniaoRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
