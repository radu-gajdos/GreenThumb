package com.example.backend.Domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
public class SoilReading extends Action{
    @Column(nullable = false) // pH is mandatory
    @Min(0) // Ensure pH is at least 0
    @Max(14) // Ensure pH is at most 14
    private Double ph;

    @PositiveOrZero // Ensure nitrogen level is non-negative
    private Double nitrogen;

    @PositiveOrZero // Ensure phosphorus level is non-negative
    private Double phosphorus;

    @PositiveOrZero // Ensure potassium level is non-negative
    private Double potassium;

    @Column(length = 255) // Limit organic matter description to 255 characters
    private String organicMatter;

    // Getters and Setters
    public Double getPh() {
        return ph;
    }

    public void setPh(Double ph) {
        this.ph = ph;
    }

    public Double getNitrogen() {
        return nitrogen;
    }

    public void setNitrogen(Double nitrogen) {
        this.nitrogen = nitrogen;
    }

    public Double getPhosphorus() {
        return phosphorus;
    }

    public void setPhosphorus(Double phosphorus) {
        this.phosphorus = phosphorus;
    }

    public Double getPotassium() {
        return potassium;
    }

    public void setPotassium(Double potassium) {
        this.potassium = potassium;
    }

    public String getOrganicMatter() {
        return organicMatter;
    }

    public void setOrganicMatter(String organicMatter) {
        this.organicMatter = organicMatter;
    }
}
