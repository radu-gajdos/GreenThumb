package com.example.backend.Domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;

@Entity
public class Treatment extends Action{
    @Column(length = 100) // Limit length to 100 characters
    private String pesticideType;

    @Column(length = 100) // Limit length to 100 characters
    private String targetPest;

    @Positive // Ensures dosage is positive
    private Double dosage;

    @Column(length = 100) // Limit length to 100 characters
    private String applicationMethod;

    // Getters and Setters
    public String getPesticideType() {
        return pesticideType;
    }

    public void setPesticideType(String pesticideType) {
        this.pesticideType = pesticideType;
    }

    public String getTargetPest() {
        return targetPest;
    }

    public void setTargetPest(String targetPest) {
        this.targetPest = targetPest;
    }

    public Double getDosage() {
        return dosage;
    }

    public void setDosage(Double dosage) {
        this.dosage = dosage;
    }

    public String getApplicationMethod() {
        return applicationMethod;
    }

    public void setApplicationMethod(String applicationMethod) {
        this.applicationMethod = applicationMethod;
    }
}
