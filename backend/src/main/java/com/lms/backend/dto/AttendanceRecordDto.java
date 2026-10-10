package com.lms.backend.dto;

import com.lms.backend.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceRecordDto {
    private Long courseId;
    private Long studentId;
    private LocalDate date;
    private AttendanceStatus status;
}