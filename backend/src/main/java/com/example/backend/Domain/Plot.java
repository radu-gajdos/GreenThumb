package com.example.backend.Domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.Proxy;

import java.util.Set;

@Entity
@Table(name = "plots")
@Proxy(lazy = false)
public class Plot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100) // Plot name is mandatory, limited to 100 characters
    private String name;

    @Column(nullable = false) // Size is mandatory
    private Double size;

    @Column(nullable = false) // Latitude is mandatory
    private Double latitude;

    @Column(nullable = false) // Longitude is mandatory
    private Double longitude;

    @Column(length = 255) // Optional: Limited to 255 characters
    private String topography;

    @Column(length = 255) // Optional: Limited to 255 characters
    private String soilType;

    @ManyToOne(fetch = FetchType.EAGER) // Foreign key to the User entity, lazily loaded
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties("plots") // Ignore the 'plots' field in related users
    private User owner;

    @OneToMany(mappedBy = "plot", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("plot") // Ignore the 'plot' field in related actions
    private Set<Action> actions;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getSize() {
        return size;
    }

    public void setSize(Double size) {
        this.size = size;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getTopography() {
        return topography;
    }

    public void setTopography(String topography) {
        this.topography = topography;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Set<Action> getActions() {
        return actions;
    }

    public void setActions(Set<Action> actions) {
        this.actions = actions;
    }
}
