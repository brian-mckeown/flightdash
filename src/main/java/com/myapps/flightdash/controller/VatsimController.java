package com.myapps.flightdash.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClientException;

@RestController
@RequestMapping("/api/v1")
public class VatsimController {

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/vatsim")
    public ResponseEntity<?> fetchVatsimData(@RequestBody IcaoRequest icaoRequest) {
        try {
            String apiUrl = "https://data.vatsim.net/v3/vatsim-data.json";
            ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);

            // Since the API does not require the ICAO code, we return the entire data.
            return ResponseEntity.ok(response.getBody());
        } catch (RestClientException e) {
            // Log the exception details
            e.printStackTrace();

            // Return an error response to the UI
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching VATSIM data from external API: " + e.getMessage());
        }
    }

    // DTO for request body
    static class IcaoRequest {
        private String icao;

        public String getIcao() {
            return icao;
        }

        public void setIcao(String icao) {
            this.icao = icao;
        }
    }
}
