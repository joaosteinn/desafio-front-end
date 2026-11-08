package com.sistema.matriculas.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_turma")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeDisciplina;

    @Column(nullable = false)
    private String nomeProfessor;

    @Column(nullable = false, length = 2)
    private String codigoHorario;

    @Column(nullable = false)
    private Integer vagasMaximas;

    @Column(nullable = false)
    private Integer vagasOcupadas;

    @Column(nullable = false)
    private String semestre;
}