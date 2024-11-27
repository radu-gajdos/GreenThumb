package com.example.backend.Repository;

import com.example.backend.Domain.Plot;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlotRepository extends JpaRepository<Plot, Long> {
    @EntityGraph(attributePaths = {"actions"})
    Optional<Plot> findById(Long id);
}
