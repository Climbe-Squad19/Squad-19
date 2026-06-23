package br.com.residencia.gestao_contratos.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.dtos.request.ReuniaoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.MeetInsightsResponse;
import br.com.residencia.gestao_contratos.dtos.response.ReuniaoGravacaoResponse;
import br.com.residencia.gestao_contratos.dtos.response.ReuniaoResponse;
import br.com.residencia.gestao_contratos.services.ReuniaoService;

@RestController
@RequestMapping("/reunioes")
public class ReuniaoController {

    private final ReuniaoService reuniaoService;

    public ReuniaoController(ReuniaoService reuniaoService) {
        this.reuniaoService = reuniaoService;
    }

    @GetMapping
    public ResponseEntity<List<ReuniaoResponse>> getAll(
            @RequestParam(required = false) Long empresaId) {
        if (empresaId != null) {
            return ResponseEntity.ok(reuniaoService.listarPorEmpresa(empresaId));
        }
        return ResponseEntity.ok(reuniaoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReuniaoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reuniaoService.buscarPorId(id));
    }

    @GetMapping("/{id}/meet/insights")
    public ResponseEntity<?> getMeetInsights(@PathVariable Long id) {
        try {
            MeetInsightsResponse response = reuniaoService.obterInsightsMeet(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Falha ao consultar dados do Google Meet";
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", message));
        }
    }

    @PostMapping("/{id}/meet/sync-gravacoes")
    public ResponseEntity<?> syncMeetRecordings(@PathVariable Long id) {
        try {
            List<ReuniaoGravacaoResponse> response = reuniaoService.sincronizarGravacoesMeet(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Falha ao sincronizar gravações do Google Meet";
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", message));
        }
    }

    @PostMapping("/meet/sync-gravacoes")
    public ResponseEntity<?> syncMeetRecordingsBulk(
            @RequestParam(defaultValue = "14") int diasRetroativos) {
        try {
            int reunioesAtualizadas = reuniaoService.sincronizarGravacoesMeetEmLote(diasRetroativos);
            return ResponseEntity.ok(Map.of(
                    "reunioesAtualizadas", reunioesAtualizadas,
                    "diasRetroativos", diasRetroativos));
        } catch (RuntimeException ex) {
            String message = ex.getMessage() != null ? ex.getMessage() : "Falha ao sincronizar gravações em lote";
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", message));
        }
    }

    @GetMapping("/{id}/meet/gravacoes")
    public ResponseEntity<List<ReuniaoGravacaoResponse>> listMeetRecordings(@PathVariable Long id) {
        return ResponseEntity.ok(reuniaoService.listarGravacoesMeet(id));
    }

    @PostMapping
    public ResponseEntity<ReuniaoResponse> create(
            @RequestBody ReuniaoCriacaoRequest request) {
        return new ResponseEntity<>(reuniaoService.agendar(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReuniaoResponse> update(
            @PathVariable Long id,
            @RequestBody ReuniaoAtualizacaoRequest request) {
        return ResponseEntity.ok(reuniaoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reuniaoService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
