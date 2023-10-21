package com.myapps.flightdash.controller;

import com.myapps.flightdash.service.ChecklistService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ChecklistController {
    @Autowired
    private ChecklistService checklistService;

    @GetMapping("/default-checklists")
    public ResponseEntity<String> getDefaultChecklists() {
        try {
            String content = checklistService.getChecklistContent();
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            // Log and return error
            return ResponseEntity.badRequest().body("Error fetching checklist");
        }
    }
}
