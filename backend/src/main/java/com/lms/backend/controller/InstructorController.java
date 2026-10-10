package com.lms.backend.controller;

import com.lms.backend.dto.CourseRequest;
import com.lms.backend.dto.GradeRequest;
import com.lms.backend.model.*;
import com.lms.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructor")
public class InstructorController {

    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    public InstructorController(
            CourseRepository courseRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            UserRepository userRepository
    ) {
        this.courseRepository = courseRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
    }

    // 1. Instructor Courses (GET, POST, PUT, DELETE)
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getMyCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @PostMapping("/courses")
    public ResponseEntity<?> addCourse(@RequestBody CourseRequest request) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .syllabus(request.getSyllabus())
                .instructorId(2L) // Logged in instructor
                .build();
        courseRepository.save(course);
        return ResponseEntity.ok(Map.of("message", "Course created successfully"));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody CourseRequest request) {
        return courseRepository.findById(id).map(course -> {
            course.setTitle(request.getTitle());
            course.setDescription(request.getDescription());
            course.setSyllabus(request.getSyllabus());
            courseRepository.save(course);
            return ResponseEntity.ok(Map.of("message", "Course updated successfully"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Course not found")));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Course not found"));
        }
        courseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }

    // 2. Submissions for Grading
    @GetMapping("/submissions")
    public ResponseEntity<List<Map<String, Object>>> getSubmissions() {
        Map<Long, Course> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, c -> c));
        Map<Long, Assignment> assignmentMap = assignmentRepository.findAll().stream()
                .collect(Collectors.toMap(Assignment::getId, a -> a));

        List<Map<String, Object>> response = new ArrayList<>();
        List<Submission> submissions = submissionRepository.findAll();

        for (Submission s : submissions) {
            Assignment assignment = assignmentMap.get(s.getAssignmentId());
            if (assignment != null) {
                Course course = courseMap.get(assignment.getCourseId());
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("studentName", s.getStudentName());
                map.put("courseTitle", course != null ? course.getTitle() : "General");
                map.put("assignmentTitle", assignment.getTitle());
                map.put("content", s.getContent());
                map.put("submittedAt", s.getSubmittedAt());
                map.put("grade", s.getGrade());
                map.put("maxMarks", assignment.getMaxMarks());
                map.put("feedback", s.getFeedback() != null ? s.getFeedback() : "");
                response.add(map);
            }
        }

        return ResponseEntity.ok(response);
    }

    // 3. Save Grade
    @PutMapping("/submissions/{id}/grade")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long id, @RequestBody GradeRequest request) {
        return submissionRepository.findById(id).map(sub -> {
            sub.setGrade(request.getGrade());
            sub.setFeedback(request.getFeedback());
            submissionRepository.save(sub);
            return ResponseEntity.ok(Map.of("message", "Grade saved successfully"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Submission not found")));
    }

    // 4. Student Performance
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentPerformance() {
        List<Map<String, Object>> students = List.of(
                Map.of("id", 1, "studentName", "Aarav Sharma", "courseTitle", "Java Programming", "progress", 85, "assignmentsDone", 4, "assignmentsTotal", 5, "averageGrade", 88),
                Map.of("id", 2, "studentName", "Priya Verma", "courseTitle", "Web Development", "progress", 92, "assignmentsDone", 5, "assignmentsTotal", 5, "averageGrade", 91),
                Map.of("id", 3, "studentName", "Rohan Gupta", "courseTitle", "Java Programming", "progress", 45, "assignmentsDone", 2, "assignmentsTotal", 5, "averageGrade", 78),
                Map.of("id", 4, "studentName", "Sneha Patel", "courseTitle", "Web Development", "progress", 70, "assignmentsDone", 3, "assignmentsTotal", 5, "averageGrade", 88)
        );
        return ResponseEntity.ok(students);
    }

    // 5. Enrollment Stats
    @GetMapping("/enrollment-stats")
    public ResponseEntity<Map<String, Object>> getEnrollmentStats() {
        List<Map<String, Object>> courses = List.of(
                Map.of("title", "Java Programming", "enrolled", 3, "averageProgress", 63, "atRisk", 1),
                Map.of("title", "Web Development", "enrolled", 2, "averageProgress", 81, "atRisk", 0)
        );

        List<Map<String, Object>> monthly = List.of(
                Map.of("month", "May", "enrollments", 4),
                Map.of("month", "Jun", "enrollments", 7),
                Map.of("month", "Jul", "enrollments", 9),
                Map.of("month", "Aug", "enrollments", 12),
                Map.of("month", "Sep", "enrollments", 15),
                Map.of("month", "Oct", "enrollments", 18)
        );

        return ResponseEntity.ok(Map.of("courses", courses, "monthly", monthly));
    }
}