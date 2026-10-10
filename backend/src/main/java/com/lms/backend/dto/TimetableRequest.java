package com.lms.backend.dto;

import com.lms.backend.model.DayOfWeek;
import lombok.Data;

@Data
public class TimetableRequest {
    private Long courseId;
    private Long instructorId;
    private DayOfWeek dayOfWeek;
    private String startTime;
    private String endTime;
    private String roomNumber;
}