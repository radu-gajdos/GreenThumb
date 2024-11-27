package com.example.backend.Repository;

import com.example.backend.Domain.SoilReading;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SoilReadingRepository extends JpaRepository<SoilReading, Long> {
}
