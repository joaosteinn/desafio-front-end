package com.sistema.matriculas.repository;

import com.sistema.matriculas.domain.model.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Long> {

    List<Turma> findBySemestre(String semestre);


    boolean existsByNomeProfessorIgnoreCaseAndCodigoHorarioAndSemestre(String nomeProfessor, String codigoHorario, String semestre);
}