package br.com.residencia.gestao_contratos.controller;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.dtos.response.AgendaEventResponse;
import br.com.residencia.gestao_contratos.dtos.response.CalendarDayResponse;
import br.com.residencia.gestao_contratos.services.DashboardService;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/agenda")
    public List<AgendaEventResponse> getAgendaDoDia(@RequestParam(required = false) String date) {
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return dashboardService.obterAgendaDoDia(targetDate);
    }

    @GetMapping("/calendar")
    public List<CalendarDayResponse> getCalendarioDoMes(@RequestParam(required = false) String month) {
        YearMonth targetMonth = month != null ? YearMonth.parse(month)
                : YearMonth.from(LocalDate.now());
        return dashboardService.obterCalendarioDoMes(targetMonth);
    }
}
