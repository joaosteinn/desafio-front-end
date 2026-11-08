package com.sistema.matriculas.controller;

import com.sistema.matriculas.domain.model.Turma;
import com.sistema.matriculas.dto.TurmaRequestDTO;
import com.sistema.matriculas.service.TurmaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turmas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TurmaController {

    private final TurmaService turmaService;

    @PostMapping
    public ResponseEntity<Turma> criarTurma(@Valid @RequestBody TurmaRequestDTO dto) {
        Turma turmaCriada = turmaService.criarOfertaTurma(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(turmaCriada);
    }

    @GetMapping
    public ResponseEntity<List<Turma>> listarTurmas(@RequestParam(defaultValue = "2026.1") String semestre) {
        return ResponseEntity.ok(turmaService.listarTurmasPorSemestre(semestre));
    }
}