package com.lms.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OverviewStatsResponse {
    private long totalUsers;
    private long totalCourses;
    private long totalEnrollments;
    private long totalInstructors;
}