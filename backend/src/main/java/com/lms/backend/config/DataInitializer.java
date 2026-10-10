package com.lms.backend.config;

import com.lms.backend.model.*;
import com.lms.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            UserRepository userRepository,
            CourseRepository courseRepository,
            MaterialRepository materialRepository,
            EnrollmentRepository enrollmentRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            TimetableRepository timetableRepository,
            AttendanceRepository attendanceRepository
    ) {
        return args -> {
            if (!userRepository.existsByEmail("admin@lms.com")) {
                userRepository.save(new User(null, "Admin", "admin@lms.com", "admin123", "ADMIN"));
            }
            User instructor = userRepository.findByEmail("instructor@lms.com").orElseGet(() ->
                    userRepository.save(new User(null, "Instructor", "instructor@lms.com", "inst123", "INSTRUCTOR"))
            );
            User student = userRepository.findByEmail("student@lms.com").orElseGet(() ->
                    userRepository.save(new User(null, "Student", "student@lms.com", "stud123", "STUDENT"))
            );

            if (courseRepository.count() == 0) {
                Course c1 = courseRepository.save(Course.builder()
                        .title("Java Programming")
                        .description("Learn core Java from basics to OOP.")
                        .syllabus("Variables, Control Flow, OOP, Collections, Exceptions")
                        .instructorId(instructor.getId())
                        .build());

                Course c2 = courseRepository.save(Course.builder()
                        .title("Web Development")
                        .description("Build websites using HTML, CSS and JavaScript.")
                        .syllabus("HTML, CSS, JavaScript, DOM, Fetch API")
                        .instructorId(instructor.getId())
                        .build());

                materialRepository.saveAll(List.of(
                        Material.builder().courseId(c1.getId()).title("Introduction to Java").type("Notes").fileName("java-introduction.txt").content("Java is an OOP language.").build(),
                        Material.builder().courseId(c1.getId()).title("OOP Concepts Guide").type("PDF").fileName("oop-concepts.txt").content("OOP Pillars: Encapsulation, Abstraction, Inheritance, Polymorphism.").build(),
                        Material.builder().courseId(c2.getId()).title("HTML and CSS Basics").type("Notes").fileName("html-css-basics.txt").content("HTML structure and CSS styling.").build()
                ));

                enrollmentRepository.save(Enrollment.builder().studentId(student.getId()).courseId(c1.getId()).build());

                Assignment a1 = assignmentRepository.save(Assignment.builder().courseId(c1.getId()).title("Java OOP Basics").description("Build Library system.").maxMarks(100).build());
                Assignment a2 = assignmentRepository.save(Assignment.builder().courseId(c2.getId()).title("Portfolio Page").description("Create personal portfolio.").maxMarks(50).build());

                submissionRepository.save(Submission.builder()
                        .assignmentId(a1.getId())
                        .studentId(student.getId())
                        .studentName("Aarav Sharma")
                        .content("library-system.zip")
                        .submittedAt(Instant.now().toString())
                        .grade(null)
                        .feedback("")
                        .build());

                // Seed Default Timetable
                timetableRepository.saveAll(List.of(
                        Timetable.builder().courseId(c1.getId()).instructorId(instructor.getId()).dayOfWeek(DayOfWeek.MONDAY).startTime("10:00 AM").endTime("11:30 AM").roomNumber("Lab-3").build(),
                        Timetable.builder().courseId(c2.getId()).instructorId(instructor.getId()).dayOfWeek(DayOfWeek.WEDNESDAY).startTime("02:00 PM").endTime("03:30 PM").roomNumber("Room-101").build(),
                        Timetable.builder().courseId(c1.getId()).instructorId(instructor.getId()).dayOfWeek(DayOfWeek.FRIDAY).startTime("11:00 AM").endTime("12:30 PM").roomNumber("Lab-3").build()
                ));

                // Seed Default Attendance for Student
                attendanceRepository.saveAll(List.of(
                        Attendance.builder().courseId(c1.getId()).studentId(student.getId()).date(LocalDate.now().minusDays(2)).status(AttendanceStatus.PRESENT).build(),
                        Attendance.builder().courseId(c1.getId()).studentId(student.getId()).date(LocalDate.now().minusDays(1)).status(AttendanceStatus.PRESENT).build(),
                        Attendance.builder().courseId(c2.getId()).studentId(student.getId()).date(LocalDate.now()).status(AttendanceStatus.ABSENT).build()
                ));
            }
        };
    }
}