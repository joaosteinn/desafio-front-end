package com.sistema.matriculas.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TurmaRequestDTO {

    @NotBlank(message = "O nome da disciplina é obrigatório.")
    private String nomeDisciplina;

    @NotBlank(message = "O nome do professor é obrigatório.")
    private String nomeProfessor;

    @NotBlank(message = "O código de horário é obrigatório.")
    @Pattern(regexp = "^[2-6][1-3]$", message = "Código de horário inválido. Deve ter 2 dígitos: Dia (2-6) e Turno (1-3). Ex: 21 ou 33.")
    private String codigoHorario;

    @NotNull(message = "O número máximo de vagas é obrigatório.")
    @Min(value = 1, message = "A turma deve ter ao menos 1 vaga.")
    private Integer vagasMaximas;

    @NotBlank(message = "O semestre é obrigatório.")
    private String semestre;
}