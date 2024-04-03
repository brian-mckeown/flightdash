package com.myapps.flightdash.controller;

import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.StreamUtils;

import io.github.cdimascio.dotenv.Dotenv;

import java.io.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/fenix-soundpack")
public class FenixSoundpackController {

    private static final String weatherApiToken;

    static {
        String token = null;
        Dotenv dotenv = null;
        if (new File("./.env").exists()) {
            dotenv = Dotenv.load();
            token = dotenv.get("WEATHER_API_TOKEN");
        } else {
            token = System.getenv("WEATHER_API_TOKEN");
        }
        weatherApiToken = token;
    }

    private String getCurrentUtcDateTime() {
        ZonedDateTime utcNow = ZonedDateTime.now(ZoneOffset.UTC);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss.SSS 'UTC'");
        return utcNow.format(formatter);
    }

    @PostMapping("/universal")
    public ResponseEntity<?> fetchLandingAnnouncement(@RequestBody Map<String, Object> payload) {
        System.out.println("Starting fetchLandingAnnouncement");

        String announcementTypeArray[] = { 
            "AfterLanding", 
            "AfterTakeoff", 
            "ArmDoors", 
            "BoardingComplete", 
            "BoardingWelcome", 
            "BoardingWelcome[Refueling]", 
            "CabinDimTakeoff",
            "CallCabinSecureLanding",
            "CallCabinSecureTakeoff",
            "CrewSeatsLanding",
            "CrewSeatsTakeoff",
            "DescentSeatbelts",
            "DisarmDoors",
            "DisembarkStarted",
            "FastenSeatbelt",
            "PreSafetyBriefing",
            "SafetyBriefing"
        };
        String announcementType = "";
        String openAiApiKey = (String) payload.get("openAiApiKey");
        String aiResponseText = "";
        List<Map<String, Object>> flightCrewArray = (List<Map<String, Object>>) payload.get("flightCrewArray");
        String airline = (String) payload.get("airline");
        String aircraftName = (String) payload.get("aircraftName");
        String flightNumber = (String) payload.get("flightNumber");
        String folderName = flightNumber.substring(0, 3);
        String currentDateTime = (String) payload.get("currentDateTime"); // Make sure to parse or convert this to a
                                                                          // Date object as needed
        String arrivalTime = (String) payload.get("arrivalTime");
        String departureIcao = (String) payload.get("departureIcao");
        String arrivalIcao = (String) payload.get("arrivalIcao");
        String flightLevelString = (String) payload.get("flightLevelString");
        String scheduledBoardingTime = (String) payload.get("scheduledBoardingTime");
        String scheduledDepartureTime = (String) payload.get("scheduledDepartureTime");
        String scheduledArrivalTime = (String) payload.get("scheduledArrivalTime");

        String departureWeatherUrl = "https://api.weatherapi.com/v1/forecast.json?q=metar:" +
                departureIcao + "&key=" + weatherApiToken;
        String arrivalWeatherUrl = "https://api.weatherapi.com/v1/forecast.json?q=metar:" +
                arrivalIcao + "&key=" + weatherApiToken;

        // set Flight Crew names:
        String captainFirstName = "";
        String captainLastName = "";
        String foFirstName = "";
        String foLastName = "";
        String leadFaFirstName = "";
        String fa2FirstName = "";
        String fa3FirstName = "";
        String fa4FirstName = "";
        String gaFirstName = "";

        for (Map<String, Object> crewMember : flightCrewArray) {
            String position = (String) crewMember.get("position");
            String firstName = (String) crewMember.get("firstName");
            String lastName = (String) crewMember.get("lastName");

            switch (position) {
                case "Captain":
                    captainFirstName = firstName;
                    captainLastName = lastName;
                    break;
                case "First Officer":
                    foFirstName = firstName;
                    foLastName = lastName;
                    break;
                case "Lead Flight Attendant":
                    leadFaFirstName = firstName;
                    break;
                case "Flight Attendant 2":
                    fa2FirstName = firstName;
                    break;
                case "Flight Attendant 3":
                    fa3FirstName = firstName;
                    break;
                case "Flight Attendant 4":
                    fa4FirstName = firstName;
                    break;
                case "Gate Attendant":
                    gaFirstName = firstName;
            }
        }
        // Create a directory to store ogg files temporarily
        Random rand = new Random();
        int randomInt = 1 + rand.nextInt(1000);
        String randomString = Integer.toString(randomInt);
        String tempDirPath = System.getProperty("java.io.tmpdir") + "/soundpacks-" + randomString;
        File tempDir = new File(tempDirPath);
        System.out.println("Creating temporary directory for ogg files: " + tempDirPath);
        if (!tempDir.exists()) {
            tempDir.mkdirs();
        }

        List<String> filenames = new ArrayList<>(); // To keep track of generated file names

        StringBuilder apiCallStatus = new StringBuilder();
        RestTemplate restTemplate = new RestTemplate();

        System.out.println("Making weather API call to: " + arrivalWeatherUrl);
        ResponseEntity<Map> weatherResponse = null; // Declare before try block
        try {
            weatherResponse = restTemplate.getForEntity(arrivalWeatherUrl, Map.class);
            apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - Status: ")
                    .append(weatherResponse.getStatusCode()).append("\n");
        } catch (HttpClientErrorException e) {
            // This will catch client errors like 401 Unauthorized and provide more details
            apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - HttpClient Error: ")
                    .append(e.getStatusCode())
                    .append(" - ")
                    .append(e.getResponseBodyAsString())
                    .append("\n");
        } catch (Exception e) {
            apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - Error: ").append(e.getMessage())
                    .append("\n");
        }
        // Initialize response variables
        String weatherDescription = null;
        Number celsiusTemp = null;
        String announcementVoice = null;
        String announcementPersonality = null;
        Map<String, Object> response = new HashMap<>();

        if (flightCrewArray != null) {
            for (Map<String, Object> crewMember : flightCrewArray) {
                if ("Lead Flight Attendant".equals(crewMember.get("position"))) {
                    announcementVoice = (String) crewMember.get("voice");
                    announcementPersonality = (String) crewMember.get("personality");
                    break; // Stop the loop once the lead flight attendant is found
                }
            }
        }

        // Check for successful response and extract data
        if (weatherResponse != null && weatherResponse.getStatusCode().is2xxSuccessful() && weatherResponse.getBody() != null) {
            // Directly cast and use the body of weatherResponse
            Map<String, Object> weatherData = (Map<String, Object>) weatherResponse.getBody();
            
            // Now, access the 'current' key directly from the weatherData map
            Map<String, Object> current = (Map<String, Object>) weatherData.get("current");
            if (current != null) {
                // Proceed to get the condition and then the text and temp_c from it
                Map<String, Object> condition = (Map<String, Object>) current.get("condition");
                if (condition != null) {
                    weatherDescription = (String) condition.get("text");
                    celsiusTemp = (Number) current.get("temp_c");
                }
            } else {
                // Handle the case where weather API call was not successful or body is null
                apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - Failed or no data received\n");
            }

        // Begin loop through all announcemnts:
        for (int i = 0; i < announcementTypeArray.length; i++) {
            announcementType = announcementTypeArray[i];
            System.out.println("Processing announcement type: " + announcementTypeArray[i]);

            // Chat GPT Script Request
            // Define Chat GPT 4 data
            String chatGptModel = "gpt-4";
            String ttsModel = "tts-1";
            double aiTemp = 0.7;
            int max_tokens = 1024;
            String systemRole = "";
            String instruction = "";

            if (announcementType.equals("AfterLanding")) {
                systemRole = "You are an experienced flight attendant for the airline: "
                        + airline
                        + ", on flight number: "
                        + flightNumber
                        + ". Your personality is: "
                        + announcementPersonality
                        + ". You are flying from "
                        + departureIcao
                        + " to "
                        + arrivalIcao
                        + ". The weather is: "
                        + weatherDescription
                        + " at " + celsiusTemp
                        + " degrees celsius. The date and time is"
                        + scheduledArrivalTime;

                instruction = "In the style of a " + announcementPersonality + ", "
                        + "Write a script for an after-landing announcement for the flight. When mentioning the flight number, only mention the number portion as individual digits, not the letters. Include all standard content in a typical airliner announcment, and also include brief information on on local attractions. If it is a holiday today or a holiday is upcoming, be sure to speak to this briefly. Always convert the temperature to fareinheit unless celsius is standard to the region. Also, provide the time in AM/PM format. Never say the icao codes directly, always say the actual city name.";
            } else if (announcementType.equals("AfterTakeoff")) {
                systemRole = "You are an experienced flight attendant for the airline:"
                        + airline
                        + ", on flight number: "
                        + flightNumber
                        + ". Your personality is: "
                        + announcementPersonality
                        + ". You are flying from "
                        + departureIcao
                        + " to "
                        + arrivalIcao;

                instruction = "In the style of a " + announcementPersonality + ", "
                        + "Write a script for an after takeoff announcement. When mentioning the flight number, only mention the number portion as individual digits, not the letters. Note that we are not at cruise altitude yet. Be sure to mention seatbelts to remain on while seatbelt signs are on, toilets located at the front and bakc of the plane, smoking not permitted, in-flight service starting in a few moments, all major credit and debit cards accepted. If mentioning the flight number, only mention the number portion as individual digits, not the letters. Include all standard content in a typical after takeoff airliner announcment to passengers. If mentioning the departure or arrival locations, always say the actual city name.";

            } else if (announcementType.equals("ArmDoors")) {
                systemRole = "You are an experienced flight attendant";

                instruction = "Write exactly: 'Cabin Crew, Arm Doors and Cross Check'."; 


            } else if (announcementType.equals("BoardingComplete")) {
                systemRole = "You are an experienced flight attendant.";

                instruction = "In the style of a " + announcementPersonality + ", "
                        + "Write a script that is exactly: 'Cabin Crew, Boarding is now complete. Any remaining ground crew, please leave the aircraft'.";

            } else if (announcementType.equals("BoardingWelcome")) {
                systemRole = "You are an experienced flight attendant for the airline:"
                        + airline
                        + ", on flight number: "
                        + flightNumber
                        + ". Your personality is: "
                        + announcementPersonality
                        + ". You are flying from "
                        + departureIcao
                        + " to "
                        + arrivalIcao
                        + ". The departure time is: " 
                        + scheduledDepartureTime
                        + ". Your name is: "
                        + leadFaFirstName;

                instruction = "In the style of a " + announcementPersonality + ", "
                        + "Write a script for a Welcome Boarding announcement to passengers. When mentioning the flight number, only mention the number portion as individual digits, not the letters. Be sure to mention baggage placement, small items under the seat, take your seat after stowing baggage, keep aisle clear to allow remaining passengers to board, no smoking. Add anything else that may be in a standard airline announcement of this type. If mentioning the departure or arrival locations, always say the actual city name.";

                } else if (announcementType.equals("BoardingWelcome[Refueling]")) {
                    systemRole = "You are an experienced flight attendant for the airline:"
                            + airline
                            + ", on flight number: "
                            + flightNumber
                            + ". Your personality is: "
                            + announcementPersonality
                            + ". You are flying from "
                            + departureIcao
                            + " to "
                            + arrivalIcao
                            + ". The departure time is: " 
                            + scheduledDepartureTime
                            + ". Your name is: "
                            + leadFaFirstName;
    
                    instruction = "In the style of a " + announcementPersonality + ", "
                            + "Write a script for a Welcome Boarding announcement to passengers that will happen while the aircraft is refueling. When mentioning the flight number, only mention the number portion as individual digits, not the letters. Be sure to mention baggage placement, small items under the seat, take your seat after stowing baggage, keep aisle clear to allow remaining passengers to board, no smoking, and keep seatbelts unfastened until seatbelt sign comes on (due to refueling). Add anything else that may be in a standard airline announcement of this type. If mentioning the departure or arrival locations, always say the actual city name.";

                } else if (announcementType.equals("CabinDimTakeoff")) {
                    systemRole = "You are an experienced flight attendant.";
    
                    instruction = "In the style of a " + announcementPersonality + ", "
                            + "Write a quick and short script for a notification to passengers that the cabin lights will be dimmed soon, and how to use the controls for reading lights.";
    
                } else if (announcementType.equals("CallCabinSecureLanding")) {
                    systemRole = "You are an experienced flight attendant.";
    
                    instruction = "Write exactly: 'Captian, the cabin is secure for landing.'";
    
                } else if (announcementType.equals("CallCabinSecureTakeoff")) {
                    systemRole = "You are an experienced flight attendant.";
    
                    instruction = "Write exactly: 'Captian, the cabin is now secure for takeoff.'";
                
                } else if (announcementType.equals("CrewSeatsLanding")) {
                    systemRole = "You are an experienced flight attendant.";
    
                    instruction = "Write exactly: 'Cabin Crew, seats for landing.'";
                
                } else if (announcementType.equals("CrewSeatsTakeoff")) {
                    systemRole = "You are an experienced flight attendant.";
    
                    instruction = "Write exactly: 'Cabin Crew, prepare for takeoff.'";
                
                } else if (announcementType.equals("DescentSeatbelts")) {
                    systemRole = "You are an experienced flight attendant for the airline:"
                            + airline
                            + ", on flight number: "
                            + flightNumber
                            + ". Your personality is: "
                            + announcementPersonality
                            + ". You are flying from "
                            + departureIcao
                            + " to "
                            + arrivalIcao;
    
                            instruction = "In the style of a " + announcementPersonality + ", "
                    + "Write a quick and short script for an announcement to passengers about landing shortly. When mentioning the flight number, only mention the number portion as individual digits, not the letters. Mention everything standard for passengers to prepare for landing on a typical airline flight. Mention that the cabin crew will be coming around to collect rubbish. Also mention that the toilets are no longer available for use. If mentioning the departure or arrival locations, always say the actual city name.";
            
                } else if (announcementType.equals("DisembarkStarted")) {
                        systemRole = "You are an experienced flight attendant.";
        
                                instruction = "In the style of a " + announcementPersonality + ", "
                        + "Write a quick and short script for an announcement to passengers that dismbarking has begun. Mention taking care to hold on to railings, supervise children, and do not walk underneath the wing of the airplane.";
                
                } else if (announcementType.equals("DisarmDoors")) {
                systemRole = "You are an experienced flight attendant.";

                instruction = "Write exactly: 'Cabin Crew, disarm doors and cross check.'";

                } else if (announcementType.equals("FastenSeatbelt")) {
                    systemRole = "You are an experienced flight attendant.";

                    instruction = "Write a quick and short script for a notification to passengers that the seatbelt sign is now on.";
                
                } else if (announcementType.equals("PreSafetyBriefing")) {
                    systemRole = "You are an experienced flight attendant.";

                    instruction = "Write a quick and short script for a notification to passengers to pay attention to the cabin crew member closest to them, as the safety demonstration is about to begin.";

                } else if (announcementType.equals("SafetyBriefing")) {
                systemRole = "You are a flight attendant for the airline: "
                        + airline
                        + ", on flight number: "
                        + flightNumber
                        + ". Your personality is: "
                        + announcementPersonality
                        + ". You are flying from "
                        + departureIcao
                        + " to "
                        + arrivalIcao
                        + ". The aircraft is: "
                        + aircraftName
                        + ". Your name is: "
                        + leadFaFirstName;

                instruction = "In the style of a " + announcementPersonality + ", "
                        + "Write a script for your safety breifing before the flight begins. Be sure to introduce yourself. Include all standard and important information that would be include in a modern airline safety announcement. When stating the flight number, just say the number portion in individual digits, not the letters.";
                }

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
            try {
                ResponseEntity<Map> openAiResponse = restTemplate.postForEntity(openAiUrl, entity, Map.class);
                apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI GPT API Call - Status: ")
                        .append(openAiResponse.getStatusCode())
                        .append("\n");

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
            } catch (HttpClientErrorException e) {
                // This will catch client errors like 401 Unauthorized and provide more details
                apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI GPT API Call - HttpClient Error: ")
                        .append(e.getStatusCode())
                        .append(" - ")
                        .append(e.getResponseBodyAsString())
                        .append("\n");
            } catch (Exception e) {
                apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI GPT API Call - Error: ")
                        .append(e.getMessage())
                        .append("\n");
            }

            Map<String, Object> ttsRequestBody = new HashMap<>();
            ttsRequestBody.put("model", ttsModel);
            ttsRequestBody.put("input", aiResponseText);
            ttsRequestBody.put("voice", announcementVoice);
            ttsRequestBody.put("response_format", "pcm");

            HttpEntity<Map<String, Object>> ttsEntity = new HttpEntity<>(ttsRequestBody, headers);
            String ttsUrl = "https://api.openai.com/v1/audio/speech";
            System.out.println("Generating TTS for announcement type: " + announcementTypeArray[i]);
            try {
                ResponseEntity<byte[]> ttsResponse = restTemplate.postForEntity(ttsUrl, ttsEntity, byte[].class);
                apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI TTS API Call - Status: ")
                        .append(ttsResponse.getStatusCode())
                        .append("\n");
                if (ttsResponse.getStatusCode().is2xxSuccessful() && ttsResponse.getBody() != null) {
                    byte[] audioData = ttsResponse.getBody();
            
                    // Directly save the OGG audio data to a file
                    String audioPath = tempDirPath + "/" + announcementType + ".pcm";
                    Files.write(Paths.get(audioPath), audioData);

                    // Add the file path to our list for zipping later
                    filenames.add(audioPath);
            
                    System.out.println("Processed and saved TTS audio to file: " + audioPath);
                } else {
                    // Handle error case
                    System.out.println("Failed to generate TTS audio for announcement type: " + announcementType);
                    // Since it's an error condition, construct a JSON response
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", apiCallStatus + "\nOpenAI TTS Call: Failed to generate audio from the text");
                    return ResponseEntity.status(ttsResponse.getStatusCode()).body(new MapResource(errorResponse));
                }
            } catch (HttpClientErrorException e) {
                // Handle HTTP client errors
                apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI TTS API Call - HttpClient Error: ")
                        .append(e.getStatusCode())
                        .append(" - ")
                        .append(e.getResponseBodyAsString())
                        .append("\n");
            } catch (Exception e) {
                apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI TTS API Call - Error: ")
                        .append(e.getMessage())
                        .append("\n");
            }
        } 
        }

        // After the loop, create and send the zip file
        ByteArrayResource resource = null; // Declare resource outside the try block to widen its scope
        String zipFilename = tempDirPath + "/ttsAudioFiles.zip";
        Path zipPath = Paths.get(zipFilename);
        System.out.println("Creating zip file: " + zipFilename);

        try (ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(zipFilename))) {
            for (String filePath : filenames) {
                File fileToZip = new File(filePath);
                String entryName = folderName + "/" + fileToZip.getName(); // Prepend folderName to the file name
                try (FileInputStream fis = new FileInputStream(fileToZip)) {
                    ZipEntry zipEntry = new ZipEntry(entryName);
                    zipOut.putNextEntry(zipEntry);
                    StreamUtils.copy(fis, zipOut);
                    zipOut.closeEntry(); // Explicitly close each ZipEntry
                }
            }
        } catch (IOException e) {
            System.out.println("Error while creating the zip file: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Attempt to initialize resource and clean up in the finally block
            try {
                if (Files.exists(zipPath)) { // Check if the zip file was successfully created
                    resource = new ByteArrayResource(Files.readAllBytes(zipPath));
                }
                // Cleanup: Delete the temporary directory and its contents
                FileUtils.deleteDirectory(new File(tempDirPath)); // Apache Commons IO
            } catch (IOException e) {
                System.out.println("Error during cleanup or reading the zip file: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        if (resource != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zipPath.getFileName().toString());
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
        
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(resource.contentLength())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } else {
            // Handle the case where resource could not be initialized properly
            System.out.println("Failed to create zip file.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate the zip file.");
        }


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

