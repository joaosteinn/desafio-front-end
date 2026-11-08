package com.sistema.matriculas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MatriculaRequestDTO {

    @NotNull(message = "O ID do aluno é obrigatório.")
    private Long alunoId;

    @NotNull(message = "O ID da turma é obrigatório.")
    private Long turmaId;
}