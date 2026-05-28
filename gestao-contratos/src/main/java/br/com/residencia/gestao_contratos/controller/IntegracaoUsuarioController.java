package br.com.residencia.gestao_contratos.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import br.com.residencia.gestao_contratos.dtos.request.IntegracaoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.IntegracaoAuthUrlResponse;
import br.com.residencia.gestao_contratos.dtos.response.IntegracoesUsuarioResponse;
import br.com.residencia.gestao_contratos.services.IntegracaoUsuarioService;

@RestController
@RequestMapping("/integracoes")
public class IntegracaoUsuarioController {

    private final IntegracaoUsuarioService integracaoUsuarioService;

    public IntegracaoUsuarioController(IntegracaoUsuarioService integracaoUsuarioService) {
        this.integracaoUsuarioService = integracaoUsuarioService;
    }

    @GetMapping("/me")
    public ResponseEntity<IntegracoesUsuarioResponse> getMinhasIntegracoes() {
        return ResponseEntity.ok(integracaoUsuarioService.buscarIntegracoesDoUsuarioLogado());
    }

    @PatchMapping("/me")
    public ResponseEntity<IntegracoesUsuarioResponse> atualizarIntegracao(
            @RequestBody IntegracaoAtualizacaoRequest request) {
        return ResponseEntity.ok(integracaoUsuarioService.atualizarIntegracaoDoUsuarioLogado(
                request.getIntegracao(),
                request.isConectado()));
    }

    @GetMapping("/google/authorize")
    public ResponseEntity<?> getGoogleAuthUrl(@RequestParam String provider) {
        try {
            String authUrl = integracaoUsuarioService.gerarUrlAutorizacaoGoogle(provider);
            return ResponseEntity.ok(new IntegracaoAuthUrlResponse(authUrl));
        } catch (RuntimeException ex) {
            String msg = ex.getMessage() != null ? ex.getMessage() : "Erro ao gerar URL do Google";
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", msg));
        }
    }

    @GetMapping("/google/callback")
    public RedirectView callbackGoogle(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error) {
        String redirectUrl = integracaoUsuarioService.processarCallbackGoogle(code, state, error);
        return new RedirectView(redirectUrl);
    }
}
