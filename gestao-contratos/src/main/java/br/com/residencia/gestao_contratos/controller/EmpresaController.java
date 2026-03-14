package br.com.residencia.gestao_contratos.controller;

import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/empresas")
public class EmpresaController {

    private final EmpresaRepository empresaRepository;

    public EmpresaController(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @GetMapping
    public List<Empresa> getAll() {
        return empresaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empresa> getById(@PathVariable Long id) {
        return empresaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa nao encontrada"));
    }

    @PostMapping
    public ResponseEntity<Empresa> create(@RequestBody Empresa empresa) {
        Empresa saved = empresaRepository.save(empresa);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empresa> update(@PathVariable Long id, @RequestBody Empresa empresa) {
        Empresa existing = empresaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa nao encontrada"));

        existing.setRazaoSocial(empresa.getRazaoSocial());
        existing.setNomeFantasia(empresa.getNomeFantasia());
        existing.setCnpj(empresa.getCnpj());
        existing.setLogradouro(empresa.getLogradouro());
        existing.setNumero(empresa.getNumero());
        existing.setBairro(empresa.getBairro());
        existing.setCidade(empresa.getCidade());
        existing.setUf(empresa.getUf());
        existing.setCep(empresa.getCep());
        existing.setTelefone(empresa.getTelefone());
        existing.setEmailContato(empresa.getEmailContato());
        existing.setNomeRepresentante(empresa.getNomeRepresentante());
        existing.setCpfRepresentante(empresa.getCpfRepresentante());
        existing.setContatoRepresentante(empresa.getContatoRepresentante());

        Empresa updated = empresaRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Empresa existing = empresaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa nao encontrada"));

        empresaRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
