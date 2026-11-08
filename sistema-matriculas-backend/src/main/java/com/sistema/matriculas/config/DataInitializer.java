package com.sistema.matriculas.config;

import com.sistema.matriculas.domain.model.Aluno;
import com.sistema.matriculas.domain.model.Matricula;
import com.sistema.matriculas.domain.model.Turma;
import com.sistema.matriculas.repository.AlunoRepository;
import com.sistema.matriculas.repository.MatriculaRepository;
import com.sistema.matriculas.repository.TurmaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;

    public DataInitializer(
            AlunoRepository alunoRepository,
            TurmaRepository turmaRepository,
            MatriculaRepository matriculaRepository) {
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.matriculaRepository = matriculaRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        matriculaRepository.deleteAll();
        turmaRepository.deleteAll();
        alunoRepository.deleteAll();

        Aluno aluno1 = alunoRepository.save(new Aluno(null, "Lucas Silva", "ALU202601"));
        Aluno aluno2 = alunoRepository.save(new Aluno(null, "Mariana Santos", "ALU202602"));
        Aluno aluno3 = alunoRepository.save(new Aluno(null, "Pedro Henrique", "ALU202603"));
        Aluno aluno4 = alunoRepository.save(new Aluno(null, "Ana Clara", "ALU202604"));
        Aluno aluno5 = alunoRepository.save(new Aluno(null, "Gabriel Santos", "ALU202605"));

        Turma t1 = turmaRepository.save(new Turma(null, "Estruturas de Dados", "Dr. Carlos Eduardo", "21", 30, 0, "2026.1"));


        Turma t2 = turmaRepository.save(new Turma(null, "Engenharia de Software", "Dra. Beatriz Santos", "33", 40, 0, "2026.1"));

        Turma t3 = turmaRepository.save(new Turma(null, "Banco de Dados II", "Prof. Ricardo Lima", "42", 2, 0, "2026.1"));

        Turma t4 = turmaRepository.save(new Turma(null, "Programação Web", "Dra. Beatriz Santos", "51", 2, 0, "2026.1"));

        Turma t5 = turmaRepository.save(new Turma(null, "Inteligência Artificial", "Dr. Carlos Eduardo", "63", 20, 0, "2026.1"));

        matricular(aluno1, t1);
        matricular(aluno1, t2);

        matricular(aluno2, t1);
        matricular(aluno2, t3);

        matricular(aluno3, t3);
        matricular(aluno3, t4);

        matricular(aluno4, t4);

        matricular(aluno5, t5);
    }

    private void matricular(Aluno aluno, Turma turma) {
        Matricula matricula = new Matricula();
        matricula.setAluno(aluno);
        matricula.setTurma(turma);
        matricula.setDataMatricula(LocalDateTime.now());
        matriculaRepository.save(matricula);

        turma.setVagasOcupadas(turma.getVagasOcupadas() + 1);
        turmaRepository.save(turma);
    }
}