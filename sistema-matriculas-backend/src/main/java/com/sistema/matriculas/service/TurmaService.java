package com.sistema.matriculas.service;

import com.sistema.matriculas.domain.model.Turma;
import com.sistema.matriculas.dto.TurmaRequestDTO;
import com.sistema.matriculas.exception.RegraNegocioException;
import com.sistema.matriculas.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository turmaRepository;

    @Transactional
    public Turma criarOfertaTurma(TurmaRequestDTO dto) {
        boolean choqueProfessor = turmaRepository.existsByNomeProfessorIgnoreCaseAndCodigoHorarioAndSemestre(
                dto.getNomeProfessor().trim(), dto.getCodigoHorario(), dto.getSemestre());

        if (choqueProfessor) {
            throw new RegraNegocioException("RN03: O professor '" + dto.getNomeProfessor()
                    + "' já possui uma turma alocada no horário " + dto.getCodigoHorario()
                    + " para o semestre " + dto.getSemestre() + ".");
        }

        Turma turma = Turma.builder()
                .nomeDisciplina(dto.getNomeDisciplina())
                .nomeProfessor(dto.getNomeProfessor())
                .codigoHorario(dto.getCodigoHorario())
                .vagasMaximas(dto.getVagasMaximas())
                .vagasOcupadas(0)
                .semestre(dto.getSemestre())
                .build();

        return turmaRepository.save(turma);
    }

    public List<Turma> listarTurmasPorSemestre(String semestre) {
        return turmaRepository.findBySemestre(semestre);
    }
}