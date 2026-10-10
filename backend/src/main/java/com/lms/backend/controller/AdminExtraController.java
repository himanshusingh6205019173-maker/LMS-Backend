package com.lms.backend.controller;

import com.lms.backend.dto.OverviewStatsResponse;
import com.lms.backend.dto.SettingsDto;
import com.lms.backend.model.Course;
import com.lms.backend.repository.CourseRepository;
import com.lms.backend.repository.EnrollmentRepository;
import com.lms.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminExtraController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    // In-memory system settings
    private SettingsDto currentSettings = new SettingsDto("My LMS", "support@lms.com", true, false);

    // In-memory activity log
    private final List<Map<String, Object>> activities = new ArrayList<>(List.of(
            Map.of("id", 1, "user", "Admin", "action", "Logged in to the system", "time", Instant.now().minusSeconds(2700).toString()),
            Map.of("id", 2, "user", "Instructor", "action", "Created course Java Programming", "time", Instant.now().minusSeconds(1800).toString()),
            Map.of("id", 3, "user", "Student", "action", "Enrolled in Web Development", "time", Instant.now().minusSeconds(1080).toString())
    ));

    public AdminExtraController(
            UserRepository userRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // 1. Overview KPIs
    @GetMapping("/overview")
    public ResponseEntity<OverviewStatsResponse> getOverview() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long totalInstructors = userRepository.findAll().stream()
                .filter(u -> "INSTRUCTOR".equalsIgnoreCase(u.getRole()))
                .count();

        return ResponseEntity.ok(new OverviewStatsResponse(
                totalUsers,
                totalCourses,
                totalEnrollments,
                totalInstructors
        ));
    }

    // 2. Performance Analytics
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        List<Course> courses = courseRepository.findAll();

        List<Map<String, Object>> courseStats = new ArrayList<>();
        for (Course c : courses) {
            courseStats.add(Map.of(
                    "title", c.getTitle(),
                    "enrolled", 35,
                    "completionRate", 75,
                    "averageGrade", 82
            ));
        }

        List<Map<String, Object>> studentStats = List.of(
                Map.of("name", "Aarav Sharma", "course", "Java Programming", "progress", 85, "grade", 88),
                Map.of("name", "Priya Verma", "course", "Web Development", "progress", 92, "grade", 91),
                Map.of("name", "Rohan Gupta", "course", "Java Programming", "progress", 45, "grade", 58)
        );

        return ResponseEntity.ok(Map.of(
                "courseStats", courseStats,
                "studentStats", studentStats
        ));
    }

    // 3. System Settings
    @GetMapping("/settings")
    public ResponseEntity<SettingsDto> getSettings() {
        return ResponseEntity.ok(currentSettings);
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody SettingsDto newSettings) {
        this.currentSettings = newSettings;
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
    }

    // 4. System Activity
    @GetMapping("/activity")
    public ResponseEntity<List<Map<String, Object>>> getActivity() {
        return ResponseEntity.ok(activities);
    }
}