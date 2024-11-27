package com.example.backend.Controller;

import com.example.backend.Domain.Plot;
import com.example.backend.Repository.PlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/plots")
public class PlotController {

    @Autowired
    private PlotRepository plotRepository;

    @GetMapping("/{id}")
    public Plot getPlotById(@PathVariable Long id) {
        // Fetch the plot by ID, including actions
        return plotRepository.findById(id).orElseThrow(() -> new RuntimeException("Plot not found"));
    }
}
