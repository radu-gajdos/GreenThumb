package com.example.backend.Domain;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100) // Full name is mandatory, limited to 100 characters
    private String fullName;

    @Column(unique = true, nullable = false, length = 255) // Email must be unique, mandatory, and limited to 255 characters
    private String email;

    @Column(nullable = false, length = 20) // Phone number is mandatory, limited to 20 characters
    private String phoneNumber;

    @Column(nullable = false, length = 255) // Password hash is mandatory, limited to 255 characters
    private String passwordHash;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // Eager loading for performance
    private Set<Plot> plots;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Set<Plot> getPlots() {
        return plots;
    }

    public void setPlots(Set<Plot> plots) {
        this.plots = plots;
    }
}
