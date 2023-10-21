package com.myapps.flightdash.service;

import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Service
public class ChecklistService {
    
    public String getChecklistContent() throws Exception {
        ClassPathResource resource = new ClassPathResource("templates/checklists.json");
        try (InputStream inputStream = resource.getInputStream()) {
            Scanner scanner = new Scanner(inputStream, StandardCharsets.UTF_8.name());
            String jsonContent = scanner.useDelimiter("\\A").next();
            scanner.close();
            return jsonContent;
        }
    }
}
