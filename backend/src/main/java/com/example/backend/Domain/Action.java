package com.example.backend.Domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Inheritance(strategy = InheritanceType.JOINED) // You can also use SINGLE_TABLE or TABLE_PER_CLASS
public abstract class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "plot_id", nullable = false)
    private Plot plot;

    @Column(nullable = false)
    private LocalDateTime actionDate;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Plot getPlot() {
        return plot;
    }

    public void setPlot(Plot plot) {
        this.plot = plot;
    }

    public LocalDateTime getActionDate() {
        return actionDate;
    }

    public void setActionDate(LocalDateTime actionDate) {
        this.actionDate = actionDate;
    }
}
