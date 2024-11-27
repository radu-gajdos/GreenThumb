package com.example.backend.Repository;

import com.example.backend.Domain.Action;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionRepository extends JpaRepository<Action, Long> {
}
