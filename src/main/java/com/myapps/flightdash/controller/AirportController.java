package com.myapps.flightdash.controller;

import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.io.File;

@RestController
public class AirportController {

    private static final Dotenv dotenv;
    private final String apiToken;

    static {
        if (new File("./.env").exists()) {
            dotenv = Dotenv.load();
        } else {
            dotenv = null;
        }
    }

    {
        if (dotenv != null) {
            apiToken = dotenv.get("AIRPORTDB_API_TOKEN");
        } else {
            apiToken = System.getenv("AIRPORTDB_API_TOKEN");
        }
    }

    private static final String AIRPORTDB_ENDPOINT = "https://airportdb.io/api/v1/airport/{ICAO}?apiToken={apiToken}";

    // Map of METAR sources with identifiers as keys and URLs as values
    private static final java.util.Map<String, String> METAR_ENDPOINT = java.util.Map.of(
        "beta_aviationweather_gov", "https://beta.aviationweather.gov/cgi-bin/data/metar.php?ids={icao}",
        "metar_vatsim_net", "https://metar.vatsim.net/metar.php?id={icao}"
    );

    @GetMapping("/api/v1/airport/{icao}/{metarSourceIdentifier}")
    public ResponseEntity<String> fetchAirportInfo(@PathVariable String icao, @PathVariable String metarSourceIdentifier) {
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(AIRPORTDB_ENDPOINT, String.class, icao, apiToken);

            if (!response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(response.getStatusCode()).body("Error fetching data from AirportDB.");
            }

            // Fetch METAR data if metarSourceIdentifier is valid
            String metarData = null;
            String metarSourceUrl = null;
            if (METAR_ENDPOINT.containsKey(metarSourceIdentifier)) {
                metarSourceUrl = METAR_ENDPOINT.get(metarSourceIdentifier);
                try {
                    ResponseEntity<String> metarResponse = restTemplate.getForEntity(metarSourceUrl, String.class, icao);
                    if (metarResponse.getStatusCode().is2xxSuccessful()) {
                        metarData = metarResponse.getBody();
                    }
                } catch (Exception metarException) {
                    System.err.println("Error fetching METAR data: " + metarException.getMessage());
                }
            }

            // Append METAR data and metarSource to airport info
            JSONObject jsonResponse = new JSONObject(response.getBody());
            jsonResponse.put("metar", metarData);
            jsonResponse.put("metarSource", metarSourceUrl);  // Adding the metarSource attribute

            return ResponseEntity.ok(jsonResponse.toString());

        } catch (Exception e) {
            System.err.println("Error fetching airport info: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal Server Error");
        }
    }
}
