package com.example.backend.Seeder;

import com.example.backend.Domain.*;
import com.example.backend.Repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PlotRepository plotRepository;
    private final ActionRepository actionRepository;
    private final FertilizingRepository fertilizingRepository;
    private final HarvestingRepository harvestingRepository;
    private final PlantingRepository plantingRepository;
    private final SoilReadingRepository soilReadingRepository;
    private final TreatmentRepository treatmentRepository;
    private final WateringRepository wateringRepository;

    public DatabaseSeeder(
            UserRepository userRepository,
            PlotRepository plotRepository,
            ActionRepository actionRepository,
            FertilizingRepository fertilizingRepository,
            HarvestingRepository harvestingRepository,
            PlantingRepository plantingRepository,
            SoilReadingRepository soilReadingRepository,
            TreatmentRepository treatmentRepository,
            WateringRepository wateringRepository
    ) {
        this.userRepository = userRepository;
        this.plotRepository = plotRepository;
        this.actionRepository = actionRepository;
        this.fertilizingRepository = fertilizingRepository;
        this.harvestingRepository = harvestingRepository;
        this.plantingRepository = plantingRepository;
        this.soilReadingRepository = soilReadingRepository;
        this.treatmentRepository = treatmentRepository;
        this.wateringRepository = wateringRepository;
    }

    @Override
    public void run(String... args) {
        seedPlotsWithActions();
    }

    private void seedPlotsWithActions() {
        // Step 1: Create a User
        User user = new User();
        user.setFullName("John Doe");
        user.setEmail("john.doe@example.com");
        user.setPhoneNumber("123456789");
        user.setPasswordHash("hashedPassword123");

        // Save the user
        user = userRepository.save(user);

        // Step 2: Create a Plot and assign the User as its owner
        Plot plot1 = new Plot();
        plot1.setName("Plot 1");
        plot1.setSize(100.0);
        plot1.setLatitude(40.7128);
        plot1.setLongitude(-74.0060);
        plot1.setTopography("Flat");
        plot1.setSoilType("Loamy");
        plot1.setOwner(user); // Assign the User as the owner of the Plot

        // Save the plot
        plot1 = plotRepository.save(plot1);

        // Create a Fertilizing action
        Fertilizing fertilizing = new Fertilizing();
        fertilizing.setPlot(plot1);
        fertilizing.setActionDate(LocalDateTime.now());
        fertilizing.setFertilizerType("Urea");
        fertilizing.setApplicationRate(50.0);
        fertilizing.setMethod("Broadcast");
        fertilizingRepository.save(fertilizing);

        // Create a Planting action
        Planting planting = new Planting();
        planting.setPlot(plot1);
        planting.setActionDate(LocalDateTime.now());
        planting.setCropType("Corn");
        planting.setVariety("Sweet Corn");
        planting.setSeedingRate("20 seeds/m²");
        planting.setPlantingDate(LocalDate.now());
        plantingRepository.save(planting);

        // Log seeded data
        System.out.println("Seeded plots and actions:");
        List<Plot> plots = plotRepository.findAll();
        plots.forEach(plot -> System.out.println("Plot: " + plot.getName() + ", Actions: " + plot.getActions().size()));
    }



}
