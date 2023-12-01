package com.myapps.flightdash.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import io.github.cdimascio.dotenv.Dotenv;

import java.io.File;
import java.util.*;

@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    private static final String weatherbitApiToken;

static {
    String token = null;
    Dotenv dotenv = null;
    if (new File("./.env").exists()) {
        dotenv = Dotenv.load();
        token = dotenv.get("WEATHERBIT_API_TOKEN");
    } else {
        token = System.getenv("WEATHERBIT_API_TOKEN");
    }
    weatherbitApiToken = token;
}
    

    @PostMapping("/landing")
    public ResponseEntity<?> fetchLandingAnnouncement(@RequestBody Map<String, Object> payload) {
        String openAiApiKey = (String) payload.get("openAiApiKey");
        String aiResponseText = "";
        List<Map<String, Object>> flightCrewArray = (List<Map<String, Object>>) payload.get("flightCrewArray");
        String airline = (String) payload.get("airline");
        String flightNumber = (String) payload.get("flightNumber");
        String currentDateTime = (String) payload.get("currentDateTime"); // Make sure to parse or convert this to a Date object as needed
        String departureIcao = (String) payload.get("departureIcao");
        String arrivalIcao = (String) payload.get("arrivalIcao");
        String weatherUrl = "https://api.weatherbit.io/v2.0/current?station=" +
                arrivalIcao + "&key=" + weatherbitApiToken + "&include=minutely";

    RestTemplate restTemplate = new RestTemplate();
    ResponseEntity<Map> weatherResponse = restTemplate.getForEntity(weatherUrl, Map.class);

    // Initialize response variables
    String weatherDescription = null;
    Number celsiusTemp = null;
    String announcementVoice = null;
    Map<String, Object> response = new HashMap<>();

    // Parse the flightCrewArray to find the Lead Flight Attendant
    if (flightCrewArray != null) {
        for (Map<String, Object> crewMember : flightCrewArray) {
            if ("Lead Flight Attendant".equals(crewMember.get("position"))) {
                announcementVoice = (String) crewMember.get("voice");
                break; // Stop the loop once the lead flight attendant is found
            }
        }
    }

    // Check for successful response and extract data
    if (weatherResponse.getStatusCode().is2xxSuccessful() && weatherResponse.getBody() != null) {
        List<Map<String, Object>> data = (List<Map<String, Object>>) weatherResponse.getBody().get("data");
        if (data != null && !data.isEmpty()) {
            Map<String, Object> weatherData = data.get(0);
            weatherDescription = (String) ((Map) weatherData.get("weather")).get("description");
            celsiusTemp = (Number) weatherData.get("temp");
        }

        //Chat GPT Script Request
        //Define Chat GPT 4 data
        String chatGptModel = "gpt-4";
        String ttsModel = "tts-1-hd";
        String systemRole = 
        "You are an experienced flight attendant for the airline: " 
        + airline 
        + ", on flight number: " 
        + flightNumber
        + ". You are flying from " 
        + departureIcao 
        + " to "
        + arrivalIcao 
        + ". The weather is: " 
        + weatherDescription 
        + " at " + celsiusTemp 
        + " degrees celsius. The date and time in UTC is " 
        + currentDateTime;

        String instruction = "Write a script for an after-landing announcement for the flight. When mentioning the flight number, only mention the number portion, not the letters. Include all standard content in a typical airliner announcment, and also include brief information on on local attractions. If it is a holiday today or a holiday is upcoming, be sure to speak to this briefly. Always convert the temperature to fareinheit unless celsius is standard to the region. Also, provide the time in AM/PM format. Never say the icao codes directly, always say the actual city name.";
        double aiTemp = 0.7;
        int max_tokens = 1024;
        
        // Define the body for the OpenAI chat completion request
        Map<String, Object> openAiRequestBody = new HashMap<>();
        openAiRequestBody.put("model", chatGptModel);
        openAiRequestBody.put("temperature", aiTemp);
        openAiRequestBody.put("max_tokens", max_tokens);
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemRole));
        messages.add(Map.of("role", "user", "content", instruction));
        openAiRequestBody.put("messages", messages);

        // Set the headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        // Create the entity
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(openAiRequestBody, headers);

        // Make the POST request to OpenAI
        String openAiUrl = "https://api.openai.com/v1/chat/completions";
        ResponseEntity<Map> openAiResponse = restTemplate.postForEntity(openAiUrl, entity, Map.class);

       // Check response and extract OpenAI response text
        if (openAiResponse.getStatusCode().is2xxSuccessful() && openAiResponse.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) openAiResponse.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> firstChoice = choices.get(0);
                if (firstChoice.containsKey("message")) {
                    Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                    aiResponseText = message.get("content");
                }
            }
        }

        Map<String, Object> ttsRequestBody = new HashMap<>();
        ttsRequestBody.put("model", ttsModel);
        ttsRequestBody.put("input", aiResponseText);
        ttsRequestBody.put("voice", announcementVoice);

        HttpEntity<Map<String, Object>> ttsEntity = new HttpEntity<>(ttsRequestBody, headers);
        String ttsUrl = "https://api.openai.com/v1/audio/speech";
        ResponseEntity<byte[]> ttsResponse = restTemplate.postForEntity(ttsUrl, ttsEntity, byte[].class);
            // Construct the response object
        if (ttsResponse.getStatusCode().is2xxSuccessful() && ttsResponse.getBody() != null) {
            // The response should be the binary data of the mp3 file
            byte[] audioData = ttsResponse.getBody();

            // Set up headers for audio response
        HttpHeaders audioHeaders = new HttpHeaders();
        audioHeaders.setContentType(MediaType.valueOf("audio/mpeg"));
        audioHeaders.setContentDisposition(ContentDisposition.builder("inline").filename("announcement.mp3").build());

        return ResponseEntity.ok()
                .headers(audioHeaders)
                .contentLength(audioData.length)
                .body(new ByteArrayResource(audioData));
        } else {
            // Handle error case
        // Since it's an error condition, construct a JSON response
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Failed to generate audio from the text");
        return ResponseEntity.status(ttsResponse.getStatusCode()).body(new MapResource(errorResponse));
        }
    }
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("internal server error");
    
}
// Helper class to wrap a Map in a Resource
    class MapResource extends ByteArrayResource {
        private final Map<String, Object> map;

        public MapResource(Map<String, Object> map) {
            super(new byte[0]);
            this.map = map;
        }

        public Map<String, Object> getMap() {
            return map;
        }
}
}