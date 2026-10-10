package com.lms.backend.controller;

import com.lms.backend.service.JdbcDatabaseService; // agar service package banaya hai
// NOTE: Agar JdbcDatabaseService ko bhi controller folder me hi rakha hai, toh upar wali import line hata dena

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jdbc")
public class JdbcTestController {

    private final JdbcDatabaseService jdbcService;

    public JdbcTestController(JdbcDatabaseService jdbcService) {
        this.jdbcService = jdbcService;
    }

    // Direct Browser Link: http://localhost:8081/api/jdbc/test
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testJdbcOperations() {
        jdbcService.insertAuditLogViaJdbc("LOGIN_VERIFIED_VIA_JDBC", "admin@lms.com");
        List<Map<String, Object>> students = jdbcService.executePureJdbcSelect("STUDENT");

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Pure JDBC execution completed successfully using H2 JDBC Driver",
                "jdbcDriver", "org.h2.Driver",
                "queriedStudentsViaResultSet", students
        ));
    }
}