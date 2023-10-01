package com.myapps.flightdash.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/v1/flightplan")
public class FlightPlanController {

    private final RestTemplate restTemplate;
    private final ObjectMapper jsonMapper;
    private final XmlMapper xmlMapper;

    public FlightPlanController() {
        this.restTemplate = new RestTemplate();
        this.jsonMapper = new ObjectMapper();
        this.xmlMapper = new XmlMapper();
    }

    @GetMapping("/{pilotID}")
    public ResponseEntity<?> getFlightPlan(@PathVariable String pilotID) {
        if (pilotID == null || pilotID.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid pilot ID");
        }

        try {
            // Fetch XML data from Simbrief
            String xmlData = restTemplate.getForObject("https://www.simbrief.com/api/xml.fetcher.php?userid=" + pilotID, String.class);

            // Convert XML to JSON
            JsonNode jsonNode = xmlMapper.readValue(xmlData, JsonNode.class);
            String json = jsonMapper.writeValueAsString(jsonNode);

            return ResponseEntity.ok(jsonMapper.readTree(json));

        } catch (HttpStatusCodeException e) {
            // This will handle errors returned from the Simbrief API (e.g., 404, 500, etc.)
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());

        } catch (Exception e) {
            // For other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while processing your request.");
        }
    }
}
