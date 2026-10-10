package com.lms.backend.repository;

import com.lms.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    Optional<Attendance> findByCourseIdAndStudentIdAndDate(Long courseId, Long studentId, LocalDate date);
}