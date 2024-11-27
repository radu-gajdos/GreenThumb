package com.example.backend.Repository;

import com.example.backend.Domain.Planting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantingRepository extends JpaRepository<Planting, Long> {
}
