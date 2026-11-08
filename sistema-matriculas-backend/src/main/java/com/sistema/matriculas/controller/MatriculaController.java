package com.sistema.matriculas.controller;

import com.sistema.matriculas.domain.model.Matricula;
import com.sistema.matriculas.dto.MatriculaRequestDTO;
import com.sistema.matriculas.service.MatriculaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MatriculaController {

    private final MatriculaService matriculaService;

    @PostMapping
    public ResponseEntity<Matricula> efetuarMatricula(@Valid @RequestBody MatriculaRequestDTO dto) {
        Matricula matricula = matriculaService.realizarMatricula(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(matricula);
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<Matricula>> listarPorAluno(@PathVariable Long alunoId) {
        return ResponseEntity.ok(matriculaService.listarMatriculasDoAluno(alunoId));
    }
}