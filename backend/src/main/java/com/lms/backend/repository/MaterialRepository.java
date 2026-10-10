package com.lms.backend.repository;

import com.lms.backend.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByCourseIdIn(List<Long> courseIds);
}