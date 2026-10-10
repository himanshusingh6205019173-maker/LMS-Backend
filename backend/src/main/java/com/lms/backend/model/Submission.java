package com.lms.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private String content; // File name or answer text

    @Column(length = 1000)
    private String notes;

    private String submittedAt;

    private Integer grade; // null until graded

    @Column(length = 1000)
    private String feedback;
}