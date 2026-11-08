package com.sistema.matriculas.service;

import com.sistema.matriculas.domain.model.*;
import com.sistema.matriculas.dto.MatriculaRequestDTO;
import com.sistema.matriculas.exception.RegraNegocioException;
import com.sistema.matriculas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatriculaService {

    private static final int LIMITE_MAXIMO_DISCIPLINAS_ALUNO = 5;

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final AlunoRepository alunoRepository;

    @Transactional
    public Matricula realizarMatricula(MatriculaRequestDTO dto) {
        Aluno aluno = alunoRepository.findById(dto.getAlunoId())
                .orElseThrow(() -> new RegraNegocioException("Aluno não encontrado (ID: " + dto.getAlunoId() + ")."));

        Turma turma = turmaRepository.findById(dto.getTurmaId())
                .orElseThrow(() -> new RegraNegocioException("Turma não encontrada (ID: " + dto.getTurmaId() + ")."));

        if (matriculaRepository.existsByAlunoIdAndTurmaId(aluno.getId(), turma.getId())) {
            throw new RegraNegocioException("Aluno já está matriculado nesta turma.");
        }
        if (turma.getVagasOcupadas() >= turma.getVagasMaximas()) {
            throw new RegraNegocioException("RN04: A turma atingiu o limite máximo de vagas.");
        }

        long totalMatriculas = matriculaRepository.countByAlunoIdAndSemestre(aluno.getId(), turma.getSemestre());
        if (totalMatriculas >= LIMITE_MAXIMO_DISCIPLINAS_ALUNO) {
            throw new RegraNegocioException("RN05: O aluno atingiu o limite máximo de "
                    + LIMITE_MAXIMO_DISCIPLINAS_ALUNO + " disciplinas no semestre.");
        }

        boolean choqueHorario = matriculaRepository.existsChoqueHorarioAluno(
                aluno.getId(), turma.getCodigoHorario(), turma.getSemestre());

        if (choqueHorario) {
            throw new RegraNegocioException("RN02: O aluno já possui disciplina matriculada no horário "
                    + turma.getCodigoHorario() + ".");
        }

        turma.setVagasOcupadas(turma.getVagasOcupadas() + 1);
        turmaRepository.save(turma);

        Matricula matricula = Matricula.builder()
                .aluno(aluno)
                .turma(turma)
                .dataMatricula(LocalDateTime.now())
                .build();

        return matriculaRepository.save(matricula);
    }

    public List<Matricula> listarMatriculasDoAluno(Long alunoId) {
        return matriculaRepository.findByAlunoId(alunoId);
    }
}