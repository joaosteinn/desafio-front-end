package com.sistema.matriculas.controller;

import com.sistema.matriculas.domain.model.Aluno;
import com.sistema.matriculas.repository.AlunoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
@CrossOrigin(origins = "*")
public class AlunoController {

    private final AlunoRepository alunoRepository;

    public AlunoController(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }
}