package com.lms.backend.controller;

import com.lms.backend.dto.CourseRequest;
import com.lms.backend.model.Course;
import com.lms.backend.repository.CourseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/courses")
public class AdminCourseController {

    private final CourseRepository courseRepository;

    public AdminCourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest request) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .syllabus(request.getSyllabus())
                .instructorId(request.getInstructorId() != null ? request.getInstructorId() : 2L)
                .build();

        courseRepository.save(course);
        return ResponseEntity.ok(Map.of("message", "Course created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody CourseRequest request) {
        return courseRepository.findById(id).map(course -> {
            course.setTitle(request.getTitle());
            course.setDescription(request.getDescription());
            course.setSyllabus(request.getSyllabus());
            if (request.getInstructorId() != null) {
                course.setInstructorId(request.getInstructorId());
            }
            courseRepository.save(course);
            return ResponseEntity.ok(Map.of("message", "Course updated successfully"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Course not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Course not found"));
        }
        courseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }
}