package br.com.residencia.gestao_contratos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.residencia.gestao_contratos.classes.Cargo;
import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.classes.Reuniao;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import br.com.residencia.gestao_contratos.repository.ReuniaoRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(EmpresaRepository empresaRepository,
                                      UsuarioRepository usuarioRepository,
                                      ContratoRepository contratoRepository,
                                      ReuniaoRepository reuniaoRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (!usuarioRepository.existsByEmail("admin@climbe.com")) {
                Usuario admin = new Usuario();
                admin.setNomeCompleto("Administrador Climbe");
                admin.setCargo(Cargo.CEO);
                admin.setCpf("11122233344");
                admin.setEmail("admin@climbe.com");
                admin.setTelefone("(79) 90000-0000");
                admin.setAtivo(true);
                admin.setSenha(passwordEncoder.encode("PrimeiroAcesso@123"));
                admin.setFotoPerfilUrl("");
                admin.setGoogleId("");
                admin.setSituacao(Usuario.SituacaoUsuario.ATIVO);
                admin.setDataCriacao(LocalDateTime.now());
                admin.setPermissoes(List.of(Cargo.CEO, Cargo.CFO, Cargo.CSO, Cargo.CMO));
                usuarioRepository.save(admin);
            }

            // Só exige DB "vazio" de empresas — o admin já pode existir (bloco anterior).
            if (empresaRepository.count() == 0 && contratoRepository.count() == 0
                    && reuniaoRepository.count() == 0) {

                Empresa empresa = new Empresa();
                empresa.setRazaoSocial("Residência Consultoria Ltda.");
                empresa.setNomeFantasia("Residência");
                empresa.setCnpj("12.345.678/0001-90");
                empresa.setLogradouro("Rua do Progresso");
                empresa.setNumero("100");
                empresa.setBairro("Centro");
                empresa.setCidade("Aracaju");
                empresa.setUf("SE");
                empresa.setCep("49000-000");
                empresa.setTelefone("(79) 99999-9999");
                empresa.setEmailContato("contato@residencia.com.br");
                empresa.setNomeRepresentante("Marcos Paulo");
                empresa.setCpfRepresentante("123.456.789-00");
                empresa.setContatoRepresentante("(79) 98888-8888");
                empresa.setAtiva(true);
                empresa.setDataCadastro(LocalDateTime.now());
                empresa = empresaRepository.save(empresa);

                Usuario usuario = new Usuario();
                usuario.setNomeCompleto("Marcos Paulo");
                usuario.setCargo(Cargo.ANALISTA_SENIOR);
                usuario.setCpf("98765432100");
                usuario.setEmail("marcos.paulo@residencia.com.br");
                usuario.setTelefone("(79) 97777-7777");
                usuario.setAtivo(true);
                usuario.setSenha(passwordEncoder.encode("senha123"));
                usuario.setFotoPerfilUrl("");
                usuario.setGoogleId("");
                usuario.setSituacao(Usuario.SituacaoUsuario.ATIVO);
                usuario.setDataCriacao(LocalDateTime.now());
                usuario.setPermissoes(List.of(Cargo.ANALISTA_SENIOR));
                usuario = usuarioRepository.save(usuario);

                Contrato contrato = new Contrato();
                contrato.setEmpresa(empresa);
                contrato.setUsuarioResponsavel(usuario);
                contrato.setTipoServico("BPO Financeiro");
                contrato.setStatus(Contrato.StatusContrato.ATIVO);
                contrato.setDataInicio(LocalDate.now().minusMonths(1));
                contrato.setDataFim(LocalDate.now().plusMonths(11));
                contrato.setDiasAvisoVencimento(30);
                contrato.setLinkContratoAssinado("https://example.com/contrato.pdf");
                contrato.setRenovacaoAutomatica(true);
                contrato.setObservacoes("Contrato de serviços financeiros para o cliente.");
                contrato.setDataCriacao(LocalDateTime.now());
                contrato = contratoRepository.save(contrato);

                Reuniao reuniao1 = new Reuniao();
                reuniao1.setPauta("Reunião de Alinhamento Estratégico");
                reuniao1.setEmpresa(empresa);
                reuniao1.setContrato(contrato);
                reuniao1.setDataHora(LocalDateTime.now().plusHours(1));
                reuniao1.setPresencial(true);
                reuniao1.setLinkOnline("");
                reuniao1.setSala("Sala 2");
                reuniao1.setParticipantesIds(List.of(usuario.getId()));
                reuniao1.setStatus(Reuniao.StatusReuniao.AGENDADA);
                reuniao1.setDataCriacao(LocalDateTime.now());
                reuniaoRepository.save(reuniao1);

                Reuniao reuniao2 = new Reuniao();
                reuniao2.setPauta("Reunião de Acompanhamento do Projeto");
                reuniao2.setEmpresa(empresa);
                reuniao2.setContrato(contrato);
                reuniao2.setDataHora(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0));
                reuniao2.setPresencial(false);
                reuniao2.setLinkOnline("https://meet.google.com/abc-defg-hij");
                reuniao2.setSala("");
                reuniao2.setParticipantesIds(List.of(usuario.getId()));
                reuniao2.setStatus(Reuniao.StatusReuniao.AGENDADA);
                reuniao2.setDataCriacao(LocalDateTime.now());
                reuniaoRepository.save(reuniao2);
            }
        };
    }
}
