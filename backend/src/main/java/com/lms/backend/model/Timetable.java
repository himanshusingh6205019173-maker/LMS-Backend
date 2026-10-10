package com.lms.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;
    private Long instructorId;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    private String startTime;
    private String endTime;
    private String roomNumber;
}