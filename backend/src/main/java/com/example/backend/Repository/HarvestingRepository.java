package com.example.backend.Repository;

import com.example.backend.Domain.Harvesting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HarvestingRepository extends JpaRepository<Harvesting, Long> {
}
