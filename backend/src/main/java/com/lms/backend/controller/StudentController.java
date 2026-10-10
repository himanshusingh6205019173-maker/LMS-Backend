package com.lms.backend.controller;

import com.lms.backend.model.*;
import com.lms.backend.repository.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final CourseRepository courseRepository;
    private final MaterialRepository materialRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public StudentController(
            CourseRepository courseRepository,
            MaterialRepository materialRepository,
            EnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository
    ) {
        this.courseRepository = courseRepository;
        this.materialRepository = materialRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    // 1. Materials List
    @GetMapping("/materials")
    public ResponseEntity<List<Map<String, Object>>> getMyMaterials() {
        Map<Long, String> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));

        List<Map<String, Object>> response = materialRepository.findAll().stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("courseId", m.getCourseId());
                    map.put("title", m.getTitle());
                    map.put("type", m.getType());
                    map.put("fileName", m.getFileName());
                    map.put("content", m.getContent());
                    map.put("courseTitle", courseMap.getOrDefault(m.getCourseId(), "Unknown Course"));
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 2. Download Material
    @GetMapping("/materials/{id}/download")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        byte[] data = (material.getTitle() + "\n\n" + material.getContent()).getBytes(StandardCharsets.UTF_8);
        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + material.getFileName() + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(resource);
    }

    // 3. Course Catalog
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourseCatalog() {
        Map<Long, String> instructorMap = userRepository.findAll().stream()
                .filter(u -> "INSTRUCTOR".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toMap(User::getId, User::getName));

        List<Map<String, Object>> catalog = courseRepository.findAll().stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", c.getId());
                    map.put("title", c.getTitle());
                    map.put("description", c.getDescription());
                    map.put("syllabus", c.getSyllabus());
                    map.put("instructorName", instructorMap.getOrDefault(c.getInstructorId(), "Unassigned"));
                    map.put("enrolled", enrollmentRepository.existsByStudentIdAndCourseId(3L, c.getId()));
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(catalog);
    }

    // 4. Enroll in Course
    @PostMapping("/enrollments")
    public ResponseEntity<?> enrollInCourse(@RequestBody Map<String, Long> payload) {
        Long courseId = payload.get("courseId");
        Long studentId = 3L; // Current logged-in student

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Already enrolled in this course"));
        }

        enrollmentRepository.save(Enrollment.builder().studentId(studentId).courseId(courseId).build());
        return ResponseEntity.ok(Map.of("message", "Enrolled successfully"));
    }

    // 5. Assignments List
    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getMyAssignments() {
        Map<Long, String> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));

        List<Map<String, Object>> list = assignmentRepository.findAll().stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("courseId", a.getCourseId());
                    map.put("courseTitle", courseMap.getOrDefault(a.getCourseId(), "General"));
                    map.put("title", a.getTitle());
                    map.put("description", a.getDescription());
                    map.put("maxMarks", a.getMaxMarks());

                    // Check if submitted
                    Optional<Submission> sub = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), 3L);
                    map.put("submission", sub.orElse(null));
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    // 6. Submit Assignment
    @PostMapping("/submissions")
    public ResponseEntity<?> submitAssignment(@RequestBody Map<String, Object> payload) {
        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
        String fileName = (String) payload.get("fileName");
        String notes = (String) payload.get("notes");

        Submission submission = Submission.builder()
                .assignmentId(assignmentId)
                .studentId(3L)
                .studentName("Student")
                .content(fileName != null && !fileName.isBlank() ? fileName : "Text answer")
                .notes(notes)
                .submittedAt(Instant.now().toString())
                .grade(null)
                .feedback("")
                .build();

        submissionRepository.save(submission);
        return ResponseEntity.ok(Map.of("message", "Assignment submitted successfully"));
    }

    // 7. Student Progress Tracking
    @GetMapping("/progress")
    public ResponseEntity<List<Map<String, Object>>> getMyProgress() {
        List<Course> courses = courseRepository.findAll();
        List<Map<String, Object>> progressList = new ArrayList<>();

        for (Course c : courses) {
            List<Assignment> courseAssignments = assignmentRepository.findByCourseId(c.getId());
            int total = courseAssignments.size();
            long done = courseAssignments.stream()
                    .filter(a -> submissionRepository.findByAssignmentIdAndStudentId(a.getId(), 3L).isPresent())
                    .count();

            int progressPercent = total > 0 ? (int) Math.round(((double) done / total) * 100) : 0;

            Map<String, Object> p = new HashMap<>();
            p.put("courseId", c.getId());
            p.put("title", c.getTitle());
            p.put("assignmentsDone", done);
            p.put("assignmentsTotal", total);
            p.put("progress", progressPercent);
            p.put("averageGrade", done > 0 ? 85 : null);

            progressList.add(p);
        }

        return ResponseEntity.ok(progressList);
    }

    // 8. Grades and Feedback
    @GetMapping("/grades")
    public ResponseEntity<List<Map<String, Object>>> getMyGrades() {
        Map<Long, String> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));

        List<Submission> submissions = submissionRepository.findByStudentId(3L);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Submission s : submissions) {
            Assignment a = assignmentRepository.findById(s.getAssignmentId()).orElse(null);
            if (a != null) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("assignmentTitle", a.getTitle());
                map.put("courseTitle", courseMap.getOrDefault(a.getCourseId(), "General"));
                map.put("maxMarks", a.getMaxMarks());
                map.put("grade", s.getGrade());
                map.put("feedback", s.getFeedback());
                map.put("submittedAt", s.getSubmittedAt());
                result.add(map);
            }
        }

        return ResponseEntity.ok(result);
    }
}