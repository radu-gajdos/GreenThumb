package com.example.backend.Repository;

import com.example.backend.Domain.Watering;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WateringRepository extends JpaRepository<Watering, Long> {
}
