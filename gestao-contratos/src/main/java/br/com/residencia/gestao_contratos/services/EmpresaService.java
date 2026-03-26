package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.dtos.request.EmpresaAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.EmpresaCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.EmpresaResponse;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;

@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    @Transactional
    public EmpresaResponse criar(EmpresaCriacaoRequest request) {

        // req 9b — unicidade do CNPJ
        if (empresaRepository.existsByCnpj(request.getCnpj()))
            throw new RuntimeException("CNPJ já cadastrado");

        Empresa empresa = new Empresa();
        empresa.setRazaoSocial(request.getRazaoSocial());
        empresa.setNomeFantasia(request.getNomeFantasia());
        empresa.setCnpj(request.getCnpj());
        empresa.setLogradouro(request.getLogradouro());
        empresa.setNumero(request.getNumero());
        empresa.setBairro(request.getBairro());
        empresa.setCidade(request.getCidade());
        empresa.setUf(request.getUf());
        empresa.setCep(request.getCep());
        empresa.setTelefone(request.getTelefone());
        empresa.setEmailContato(request.getEmailContato());
        empresa.setNomeRepresentante(request.getNomeRepresentante());
        empresa.setCpfRepresentante(request.getCpfRepresentante());
        empresa.setContatoRepresentante(request.getContatoRepresentante());
        empresa.setAtiva(true);
        empresa.setDataCadastro(LocalDateTime.now());

        Empresa salva = empresaRepository.save(empresa);
        return converterParaResponse(salva);
    }

    @Transactional
    public EmpresaResponse atualizar(Long id, EmpresaAtualizacaoRequest request) {
        Empresa empresa = buscarEntidadePorId(id);

        empresa.setRazaoSocial(request.getRazaoSocial());
        empresa.setNomeFantasia(request.getNomeFantasia());
        empresa.setLogradouro(request.getLogradouro());
        empresa.setNumero(request.getNumero());
        empresa.setBairro(request.getBairro());
        empresa.setCidade(request.getCidade());
        empresa.setUf(request.getUf());
        empresa.setCep(request.getCep());
        empresa.setTelefone(request.getTelefone());
        empresa.setEmailContato(request.getEmailContato());
        empresa.setNomeRepresentante(request.getNomeRepresentante());
        empresa.setCpfRepresentante(request.getCpfRepresentante());
        empresa.setContatoRepresentante(request.getContatoRepresentante());

        Empresa atualizada = empresaRepository.save(empresa);
        return converterParaResponse(atualizada);
    }

    public List<EmpresaResponse> listarTodos() {
        return empresaRepository.findAll().stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public EmpresaResponse buscarPorId(Long id) {
        return converterParaResponse(buscarEntidadePorId(id));
    }

    @Transactional
    public void inativar(Long id) {
        Empresa empresa = buscarEntidadePorId(id);
        empresa.setAtiva(false);
        empresaRepository.save(empresa);
    }

    private Empresa buscarEntidadePorId(Long id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
    }

    private EmpresaResponse converterParaResponse(Empresa empresa) {
        EmpresaResponse response = new EmpresaResponse();
        response.setId(empresa.getId());
        response.setRazaoSocial(empresa.getRazaoSocial());
        response.setNomeFantasia(empresa.getNomeFantasia());
        response.setCnpj(empresa.getCnpj());
        response.setLogradouro(empresa.getLogradouro());
        response.setNumero(empresa.getNumero());
        response.setBairro(empresa.getBairro());
        response.setCidade(empresa.getCidade());
        response.setUf(empresa.getUf());
        response.setCep(empresa.getCep());
        response.setTelefone(empresa.getTelefone());
        response.setEmailContato(empresa.getEmailContato());
        response.setNomeRepresentante(empresa.getNomeRepresentante());
        response.setContatoRepresentante(empresa.getContatoRepresentante());
        response.setAtiva(empresa.isAtiva());
        response.setDataCadastro(empresa.getDataCadastro());

        if (empresa.getCpfRepresentante() != null &&
                empresa.getCpfRepresentante().length() == 11) {
            String cpf = empresa.getCpfRepresentante();
            response.setCpfRepresentante("***" + cpf.substring(3, 9) + "**");
        }

        return response;
    }
}