package com.lms.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Pure JDBC Implementation using standard java.sql interfaces:
 * Connection, PreparedStatement, Statement, and ResultSet.
 */
@Service
public class JdbcDatabaseService {

    @Value("${spring.datasource.url:jdbc:h2:mem:lmsdb}")
    private String dbUrl;

    @Value("${spring.datasource.username:sa}")
    private String dbUser;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    // 1. JDBC Connection helper method
    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }

    // 2. Pure JDBC SELECT query using PreparedStatement and ResultSet
    public List<Map<String, Object>> executePureJdbcSelect(String role) {
        List<Map<String, Object>> results = new ArrayList<>();
        String sql = "SELECT id, name, email, role FROM users WHERE role = ?";

        // Try-with-resources auto-closes Connection and PreparedStatement
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, role);

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id", rs.getLong("id"));
                    row.put("name", rs.getString("name"));
                    row.put("email", rs.getString("email"));
                    row.put("role", rs.getString("role"));
                    results.add(row);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return results;
    }

    // 3. Pure JDBC INSERT/UPDATE operation using PreparedStatement
    public int insertAuditLogViaJdbc(String action, String performedBy) {
        String createTableSql = "CREATE TABLE IF NOT EXISTS audit_logs (" +
                "id IDENTITY PRIMARY KEY, action VARCHAR(255), performed_by VARCHAR(255), logged_at TIMESTAMP)";

        String insertSql = "INSERT INTO audit_logs (action, performed_by, logged_at) VALUES (?, ?, CURRENT_TIMESTAMP)";

        try (Connection conn = getConnection()) {
            // Statement for DDL
            try (Statement stmt = conn.createStatement()) {
                stmt.execute(createTableSql);
            }
            // PreparedStatement for parameterized DML
            try (PreparedStatement pstmt = conn.prepareStatement(insertSql)) {
                pstmt.setString(1, action);
                pstmt.setString(2, performedBy);
                return pstmt.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        }
    }
}