package com.lms.backend.controller;

import com.lms.backend.dto.AttendanceRecordDto;
import com.lms.backend.dto.TimetableRequest;
import com.lms.backend.model.*;
import com.lms.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ScheduleAttendanceController {

    private final TimetableRepository timetableRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;

    public ScheduleAttendanceController(
            TimetableRepository timetableRepository,
            AttendanceRepository attendanceRepository,
            CourseRepository courseRepository) {
        this.timetableRepository = timetableRepository;
        this.attendanceRepository = attendanceRepository;
        this.courseRepository = courseRepository;
    }

    // 1. Sabhi users ke liye Timetable fetch karna
    @GetMapping("/timetable")
    public ResponseEntity<List<Map<String, Object>>> getTimetable() {
        Map<Long, String> courses = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));

        List<Map<String, Object>> response = timetableRepository.findAll().stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("courseTitle", courses.getOrDefault(t.getCourseId(), "General"));
            map.put("dayOfWeek", t.getDayOfWeek().name());
            map.put("startTime", t.getStartTime());
            map.put("endTime", t.getEndTime());
            map.put("roomNumber", t.getRoomNumber());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 2. Admin ya Instructor dwara Timetable slot add karna
    @PostMapping("/admin/timetable")
    public ResponseEntity<?> addTimetableSlot(@RequestBody TimetableRequest req) {
        Timetable slot = Timetable.builder()
                .courseId(req.getCourseId())
                .instructorId(req.getInstructorId() != null ? req.getInstructorId() : 2L)
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .roomNumber(req.getRoomNumber())
                .build();
        timetableRepository.save(slot);
        return ResponseEntity.ok(Map.of("message", "Timetable slot added successfully"));
    }

    // 3. Instructor attendance mark karega
    @PostMapping("/instructor/attendance")
    public ResponseEntity<?> markAttendance(@RequestBody AttendanceRecordDto dto) {
        LocalDate date = dto.getDate() != null ? dto.getDate() : LocalDate.now();

        Attendance record = attendanceRepository
                .findByCourseIdAndStudentIdAndDate(dto.getCourseId(), dto.getStudentId(), date)
                .orElse(Attendance.builder()
                        .courseId(dto.getCourseId())
                        .studentId(dto.getStudentId())
                        .date(date)
                        .build());

        record.setStatus(dto.getStatus());
        attendanceRepository.save(record);

        return ResponseEntity.ok(Map.of("message", "Attendance recorded successfully"));
    }

    // 4. Student apni attendance summary dekhega
    @GetMapping("/student/attendance")
    public ResponseEntity<Map<String, Object>> getStudentAttendance(@RequestParam(defaultValue = "3") Long studentId) {
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        long totalClasses = records.size();
        long attended = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        double percentage = totalClasses > 0 ? ((double) attended / totalClasses) * 100 : 0.0;

        Map<Long, String> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));

        List<Map<String, Object>> history = records.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", r.getDate().toString());
            map.put("courseTitle", courseMap.getOrDefault(r.getCourseId(), "General"));
            map.put("status", r.getStatus().name());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalClasses", totalClasses);
        result.put("attendedClasses", attended);
        result.put("percentage", Math.round(percentage * 10.0) / 10.0);
        result.put("history", history);

        return ResponseEntity.ok(result);
    }
}