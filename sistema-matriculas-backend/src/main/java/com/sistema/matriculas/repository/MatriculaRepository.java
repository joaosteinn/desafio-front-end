package com.sistema.matriculas.repository;

import com.sistema.matriculas.domain.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByAlunoId(Long alunoId);

    @Query("SELECT COUNT(m) FROM Matricula m WHERE m.aluno.id = :alunoId AND m.turma.semestre = :semestre")
    long countByAlunoIdAndSemestre(@Param("alunoId") Long alunoId, @Param("semestre") String semestre);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Matricula m " +
            "WHERE m.aluno.id = :alunoId " +
            "AND m.turma.semestre = :semestre " +
            "AND m.turma.codigoHorario = :codigoHorario")
    boolean existsChoqueHorarioAluno(@Param("alunoId") Long alunoId,
                                     @Param("codigoHorario") String codigoHorario,
                                     @Param("semestre") String semestre);

    boolean existsByAlunoIdAndTurmaId(Long alunoId, Long turmaId);
}