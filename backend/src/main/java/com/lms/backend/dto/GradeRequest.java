package com.lms.backend.dto;

import lombok.Data;

@Data
public class GradeRequest {
    private int grade;
    private String feedback;
}