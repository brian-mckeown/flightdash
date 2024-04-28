package com.myapps.flightdash.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import io.github.cdimascio.dotenv.Dotenv;

import java.io.File;
import java.util.*;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;


@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

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

        String announcementType = (String)payload.get("announcementType");
        String openAiApiKey = (String) payload.get("openAiApiKey");
        String aiResponseText = "";
        List<Map<String, Object>> flightCrewArray = (List<Map<String, Object>>) payload.get("flightCrewArray");
        String airline = (String) payload.get("airline");
        String aircraftName = (String) payload.get("aircraftName");
        String flightNumber = (String) payload.get("flightNumber");
        String currentDateTime = (String) payload.get("currentDateTime"); // Make sure to parse or convert this to a Date object as needed
        String arrivalTime = (String) payload.get("arrivalTime");
        String departureIcao = (String) payload.get("departureIcao");
        String arrivalIcao = (String) payload.get("arrivalIcao");
        String flightLevelString = (String) payload.get("flightLevelString");
        String scheduledBoardingTime = (String) payload.get("scheduledBoardingTime");
        String scheduledDepartureTime = (String) payload.get("scheduledDepartureTime");
        String customPassengers = (String) payload.get("customPassengers");

        if (customPassengers == null || customPassengers.isEmpty()) {
            customPassengers = "passengers";
        }
        
        
        String departureWeatherUrl = "https://api.weatherapi.com/v1/forecast.json?q=metar:" +
                departureIcao + "&key=" + weatherApiToken;
        String arrivalWeatherUrl = "https://api.weatherapi.com/v1/forecast.json?q=metar:" +
                arrivalIcao + "&key=" + weatherApiToken;

        //set Flight Crew names:
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
        
    StringBuilder apiCallStatus = new StringBuilder();
    RestTemplate restTemplate = new RestTemplate();

    ResponseEntity<Map> weatherResponse = null; // Declare before try block
    try {
        weatherResponse = restTemplate.getForEntity(arrivalWeatherUrl, Map.class);
        apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - Status: ").append(weatherResponse.getStatusCode()).append("\n");
    } catch (HttpClientErrorException e) {
    // This will catch client errors like 401 Unauthorized and provide more details
    apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - HttpClient Error: ")
                 .append(e.getStatusCode())
                 .append(" - ")
                 .append(e.getResponseBodyAsString())
                 .append("\n");
} catch (Exception e) {
    apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - Error: ").append(e.getMessage()).append("\n");
    }
    // Initialize response variables
    String weatherDescription = null;
    Number celsiusTemp = null;
    String announcementVoice = null;
    String announcementPersonality = null;
    Map<String, Object> response = new HashMap<>();

    if (announcementType.equals("landing") || announcementType.equals("safety") || announcementType.equals("seatbelts-off") || announcementType.equals("in-flight-start") || announcementType.equals("in-flight-end")) {
        // Parse the flightCrewArray to find the Lead Flight Attendant
        if (flightCrewArray != null) {
            for (Map<String, Object> crewMember : flightCrewArray) {
                if ("Lead Flight Attendant".equals(crewMember.get("position"))) {
                    announcementVoice = (String) crewMember.get("voice");
                    announcementPersonality = (String) crewMember.get("personality");
                    break; // Stop the loop once the lead flight attendant is found
                }
            }
        }
    } else if (announcementType.equals("pre taxi") || announcementType.equals("cruise") || announcementType.equals("descent") || announcementType.equals("seatbelts-turbulence") || announcementType.equals("cleared-takeoff")) {
        // Parse the flightCrewArray to find the Captain
        if (flightCrewArray != null) {
            for (Map<String, Object> crewMember : flightCrewArray) {
                if ("Captain".equals(crewMember.get("position"))) {
                    announcementVoice = (String) crewMember.get("voice");
                    announcementPersonality = (String) crewMember.get("personality");
                    break; // Stop the loop once the Captain is found
                }
            }
        }
    } else if (announcementType.equals("pre boarding") || 
                announcementType.equals("boarding1") ||
                announcementType.equals("boarding2") ||
                announcementType.equals("boarding3") ||
                announcementType.equals("boarding4") ||
                announcementType.equals("boarding5") ||
                announcementType.equals("boarding6")) {
        // Parse the flightCrewArray to find the Gate Attendant
        if (flightCrewArray != null) {
            for (Map<String, Object> crewMember : flightCrewArray) {
                if ("Gate Attendant".equals(crewMember.get("position"))) {
                    announcementVoice = (String) crewMember.get("voice");
                    announcementPersonality = (String) crewMember.get("personality");
                    break; // Stop the loop once the Gate Attendant is found
                }
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
        }

        //Chat GPT Script Request
        //Define Chat GPT 4 data
        String chatGptModel = "gpt-4";
        String ttsModel = "tts-1-hd";
        double aiTemp = 0.7;
        int max_tokens = 1024;
        String systemRole = "";
        String instruction = "";


        if (announcementType.equals("landing")) {
        systemRole = 
        "You are an experienced flight attendant for the airline: " 
        + airline 
        + ", on flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". You are flying from " 
        + departureIcao 
        + " to "
        + arrivalIcao 
        + ". The weather is: " 
        + weatherDescription 
        + " at " + celsiusTemp 
        + " degrees celsius. The date and time in UTC is " 
        + currentDateTime
        + ". The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for an after-landing announcement for the flight. Be sure to speak directly to the audience type, which is: " + customPassengers + ". When mentioning the flight number, only mention the number portion as individual digits, not the letters. Include all standard content in a typical airliner announcment, and also include brief information on on local attractions. If it is a holiday today or a holiday is upcoming, be sure to speak to this briefly. Always convert the temperature to fareinheit unless celsius is standard to the region. Also, provide the time in AM/PM format. Never say the icao codes directly, always say the actual city name.";
        }
        else if (announcementType.equals("pre taxi")) {
        systemRole = 
        "You are airliner captain for the airline: " 
        + airline 
        + ", on flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". You are flying from " 
        + departureIcao 
        + " to "
        + arrivalIcao 
        + ". The weather at the destination is: " 
        + weatherDescription 
        + " at " + celsiusTemp 
        + " degrees celsius. The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected arrival time is: "
        + arrivalTime + ". Always convert from the timezone given in the expected arrival time to the timezone of the arrival location. " 
        + "Your name is: " 
        + captainFirstName + " " + captainLastName
        + ". Your First Officer's name is: "
        + foFirstName + " " + foLastName
        + ". Your flight attendants are: " 
        + leadFaFirstName + ", "
        + fa2FirstName + ", "
        + fa3FirstName + ", "
        + fa4FirstName + ". "
        + "The flight level is the first number after the ICAO code in the following string: "
        + flightLevelString
        +" . Always read this in thousand feet. Example: 0320 is Thirty two thousand feet."
        + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for your captain's announcement before a flight begins, welcoming the passengers and introducing the flight crew. Be sure to speak directly to the audience type, which is:" + customPassengers + ". When mentioning the flight number, only mention the number portion as individual digits, not the letters. Include all standard content in a typical preflight airliner announcment to passengers, and also mention the estimated time to arrive and expected weather conditions. Always convert the temperature to fareinheit unless celsius is standard to the region. Also, provide the time in AM/PM format and in the correct timezone for the destination, and be sure to account for correct daylight savings. Don't talk about the timezone or daylight savings though. The flight level should be said in feet. Never say the icao codes directly, always say the actual city name. Safety briefings to follow will be made by the flight attendants.";
        
        }
        else if (announcementType.equals("safety")) {
        systemRole = 
        "You are a flight attendant for the airline: " 
        + airline 
        + ", on flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". You are flying from " 
        + departureIcao 
        + " to "
        + arrivalIcao 
        + ". The aircraft is: " 
        + aircraftName
        + ". Your name is: " 
        + leadFaFirstName
        + ". The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for your safety breifing before the flight begins. Be sure to introduce yourself. Be sure to speak directly to the audience type, which is:" + customPassengers + ". Include all standard and important information that would be include in a modern airline safety announcement. When stating the flight number, just say the number portion in individual digits, not the letters.";
        }
        else if (announcementType.equals("cleared-takeoff")) {
            systemRole = 
            "You are airliner captain for the airline: " 
            + airline 
            + ", on flight number: " 
            + flightNumber
            +". Your personality is: "
            + announcementPersonality
            + ". You are flying from " 
            + departureIcao 
            + " to "
            + arrivalIcao 
            + ".";
    
            instruction = "In the style of a " + announcementPersonality + ", " + "Write an extremely brief script for a captain's announcement for letting the crew know we've been cleared for takeoff. Ensure to mention that crew should be seated for takeoff.";
            }
        else if (announcementType.equals("seatbelts-off")) {
        systemRole = 
        "You are a flight attendant for the airline: " 
        + airline 
        + ", on flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". You are flying from " 
        + departureIcao 
        + " to "
        + arrivalIcao 
        + ". The aircraft is: " 
        + aircraftName
        + ". Your name is: " 
        + leadFaFirstName
        + ". The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a short script for an announcement when the seatbelt sign has been turned off. Be sure to speak directly to the audience type, which is: " + customPassengers + ". Include all standard and important information that would be included in this type of modern airline announcement. Mention that passengers are now free to use electronics. If stating the flight number, just say the number portion in individual digits, not the letters. This announcement should be very brief and to the point. The aircraft has not reached cruise altitude yet.";
        }
        else if (announcementType.equals("seatbelts-turbulence")) {
            systemRole = 
            "You are airliner captain for the airline: " 
            + airline 
            + ", on flight number: " 
            + flightNumber
            +". Your personality is: "
            + announcementPersonality
            + ". You are flying from " 
            + departureIcao 
            + " to "
            + arrivalIcao 
            + ".";
    
            instruction = "In the style of a " + announcementPersonality + ", " + "Write an extremely brief script for a captain's announcement for when seatbelt signs come on for turbulence.";
            }
        else if (announcementType.equals("cruise")) {
        systemRole = 
        "You are airliner captain for the airline: " 
        + airline 
        + ", on flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". You are flying from " 
        + departureIcao 
        + " to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected arrival time is: "
        + arrivalTime + ". Always convert from the timezone given in the expected arrival time to the timezone of the arrival location. " 
        + "Your flight attendants are: " 
        + leadFaFirstName + ", "
        + fa2FirstName + ", "
        + fa3FirstName + ", "
        + fa4FirstName + ". "
        + "The flight level is the first number after the ICAO code in the following string: "
        + flightLevelString
         +" . Always read this in thousand feet. Example: 0320 is Thirty two thousand feet."
         + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a brief captain's announcement for reaching cruise altitude during the flight. Be sure to speak directly to the audience type, which is: " + customPassengers + ". When mentioning the flight number, only mention the number portion as individual digits, not the letters. Include all standard content in a typical cruise level airliner announcment to passengers, and also mention the estimated time to arrive and expected weather conditions. Always convert the temperature to fareinheit unless celsius is standard to the region. Also, provide the time in AM/PM format and in the correct timezone for the destination, and be sure to account for correct daylight savings. Don't talk about the timezone or daylight savings though. The flight level should be said in feet. Never say the icao codes directly, always say the actual city name. Mention that the flight attendants will be providing in flight services shortly.";
        }
        else if (announcementType.equals("in-flight-start")) {
            systemRole = 
            "You are a flight attendant for the airline: " 
            + airline 
            + ", on flight number: " 
            + flightNumber
            +". Your personality is: "
            + announcementPersonality
            + ". You are flying from " 
            + departureIcao 
            + " to "
            + arrivalIcao 
            + ". The aircraft is: " 
            + aircraftName
            + ". Your name is: " 
            + leadFaFirstName
            + ". The passengers consist of: "
            + customPassengers;
    
            instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for an announcement when the in-flight services are starting. Be sure to speak directly to the audience type, which is: " + customPassengers + ". Include all standard and important information that would be included in this type of modern airline announcement. If stating the flight number, just say the number portion in individual digits, not the letters.";
            }
        else if (announcementType.equals("descent")) {
        systemRole = 
        "You are airliner captain for the airline: " 
        + airline 
        + ", on flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". You are flying from " 
        + departureIcao 
        + " to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected arrival time is: "
        + arrivalTime + ". Always convert from the timezone given in the expected arrival time to the timezone of the arrival location. " 
        + "The flight level is the first number after the ICAO code in the following string: "
        + flightLevelString
         +" . Always read this in thousand feet. Example: 0320 is Thirty two thousand feet."
         + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a brief captain's announcement for beginning descent during the flight, which has just begun. Be sure to speak directly to the audience type, which is: " + customPassengers + ". When mentioning the flight number, only mention the number portion as individual digits, not the letters. Include all standard content in a typical descent airliner announcment to passengers, and also mention the estimated time to arrive and expected weather conditions. Always convert the temperature to fareinheit unless celsius is standard to the region. Also, provide the time in AM/PM format and in the correct timezone for the destination, and be sure to account for correct daylight savings. Don't talk about the timezone or daylight savings though. The flight level should be said in feet. Never say the icao codes directly, always say the actual city name.";
        }
        else if (announcementType.equals("in-flight-end")) {
            systemRole = 
            "You are a flight attendant for the airline: " 
            + airline 
            + ", on flight number: " 
            + flightNumber
            +". Your personality is: "
            + announcementPersonality
            + ". You are flying from " 
            + departureIcao 
            + " to "
            + arrivalIcao 
            + ". The aircraft is: " 
            + aircraftName
            + ". Your name is: " 
            + leadFaFirstName
            + ". The passengers consist of: "
            + customPassengers;
    
            instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for an announcement when the in-flight services are ending as the aircraft is already descending for landing. Be sure to speak directly to the audience type, which is: " + customPassengers + ".  Be sure to mention that flight attendants will be coming around to collect any garbage. Include all standard and important information that would be included in this type of modern airline announcement. If stating the flight number, just say the number portion in individual digits, not the letters.";
            }
        else if (announcementType.equals("pre boarding")) {
        systemRole = 
        "You are a gate attendant named: "
        + gaFirstName 
        + ", for a commerical airline flight: " 
        + airline 
        + ", flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". The flight departs from " 
        + departureIcao 
        + ", and is flying to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected departure time is: "
        + scheduledDepartureTime + ", "
        + "and the scheduled boarding time is: "
        + scheduledBoardingTime
        + ". Always convert from the timezone given in the departure and boarding times to the timezone of the departure location. "
        + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a brief, semi-casual, pre boarding announcement for passengers. Be sure to speak directly to the audience type, which is: " + customPassengers + ". This is the first announcement they are hearing. Start the announcement with a phrase like attention passengers for airline flight and number from departure to arrival. When mentioning the flight number, only mention airline name followed by the number portion as individual digits, not the letters. Be sure to introduce yourself. Include all standard content in a typical pre boarding airline announcment to passengers, and also mention the estimated time until boarding begins. Also, provide the time in AM/PM format, and be sure to account for correct daylight savings. Don't talk about the timezone or daylight savings though. Never say the icao codes directly, always say the actual city name. Keep the announcement short, and to the point. Don't use too many extra adjectives or other fluff words.";
        }
        else if (announcementType.equals("boarding1")) {
        systemRole = 
        "You are a gate attendant or a commerical airline flight: " 
        + airline 
        + ", flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". The flight departs from " 
        + departureIcao 
        + ", and is flying to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected departure time is: "
        + scheduledDepartureTime + ", "
        + "and the scheduled boarding time is: "
        + scheduledBoardingTime
        + ". Always convert from the timezone given in the departure and boarding times to the timezone of the departure location. "
        + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a very brief announcement that Passengers needing wheel chair assistance, families with small children and Group 1 passengers can begin boarding at this time. Be sure to speak directly to the audience type, which is: " + customPassengers + ". Add a quick bit about any airline specific memberships. Don't introduce yourself. When mentioning the flight number, only mention airline name followed by the number portion as individual digits, not the letters. Never say the icao codes directly, always say the actual city name. Keep the announcement short, and to the point. Don't use too many extra adjectives or other fluff words.";
        }
        else if (announcementType.equals("boarding2")) {
        systemRole = 
        "You are a gate attendant or a commerical airline flight: " 
        + airline 
        + ", flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". The flight departs from " 
        + departureIcao 
        + ", and is flying to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected departure time is: "
        + scheduledDepartureTime + ", "
        + "and the scheduled boarding time is: "
        + scheduledBoardingTime
        + ". Always convert from the timezone given in the departure and boarding times to the timezone of the departure location."
        + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a very brief announcement that Group 2 passengers can begin boarding at this time. Be sure to speak directly to the audience type, which is: " + customPassengers + ". Don't introduce yourself. When mentioning the flight number, only mention airline name followed by the number portion as individual digits, not the letters. Never say the icao codes directly, always say the actual city name. Keep the announcement short, and to the point. Don't use too many extra adjectives or other fluff words.";
        }
        else if (announcementType.equals("boarding3")) {
        systemRole = 
        "You are a gate attendant or a commerical airline flight: " 
        + airline 
        + ", flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". The flight departs from " 
        + departureIcao 
        + ", and is flying to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected departure time is: "
        + scheduledDepartureTime + ", "
        + "and the scheduled boarding time is: "
        + scheduledBoardingTime
        + ". Always convert from the timezone given in the departure and boarding times to the timezone of the departure location."
        + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a very brief announcement that Group 3 passengers can begin boarding at this time. Be sure to speak directly to the audience type, which is: " + customPassengers + ". Don't introduce yourself. When mentioning the flight number, only mention airline name followed by the number portion as individual digits, not the letters. Never say the icao codes directly, always say the actual city name. Keep the announcement short, and to the point. Don't use too many extra adjectives or other fluff words.";
        }
        else if (announcementType.equals("boarding4")) {
        systemRole = 
        "You are a gate attendant or a commerical airline flight: " 
        + airline 
        + ", flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". The flight departs from " 
        + departureIcao 
        + ", and is flying to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected departure time is: "
        + scheduledDepartureTime + ", "
        + "and the scheduled boarding time is: "
        + scheduledBoardingTime
        + ". Always convert from the timezone given in the departure and boarding times to the timezone of the departure location."
        + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a very brief announcement that Group 4 and any remaining passengers can begin boarding at this time. Be sure to speak directly to the audience type, which is: " + customPassengers + ".  Don't introduce yourself. When mentioning the flight number, only mention airline name followed by the number portion as individual digits, not the letters. Never say the icao codes directly, always say the actual city name. Keep the announcement short, and to the point. Don't use too many extra adjectives or other fluff words.";
        }
        else if (announcementType.equals("boarding5")) {
        systemRole = 
        "You are a gate attendant or a commerical airline flight: " 
        + airline 
        + ", flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". The flight departs from " 
        + departureIcao 
        + ", and is flying to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected departure time is: "
        + scheduledDepartureTime + ", "
        + "and the scheduled boarding time is: "
        + scheduledBoardingTime
        + ". Always convert from the timezone given in the departure and boarding times to the timezone of the departure location."
        + " The passengers consist of: "
        + customPassengers;

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a very brief announcement for last call for passengers to board the flight, and the gates are about to close. Be sure to speak directly to the audience type, which is: " + customPassengers + ". Don't introduce yourself. When mentioning the flight number, only mention airline name followed by the number portion as individual digits, not the letters. Never say the icao codes directly, always say the actual city name. Keep the announcement short, and to the point. Don't use too many extra adjectives or other fluff words.";
        }
        else if (announcementType.equals("boarding6")) {
        systemRole = 
        "You are a gate attendant or a commerical airline flight: " 
        + airline 
        + ", flight number: " 
        + flightNumber
        +". Your personality is: "
        + announcementPersonality
        + ". The flight departs from " 
        + departureIcao 
        + ", and is flying to "
        + arrivalIcao 
        + ". The date and time in UTC is " 
        + currentDateTime + ". " 
        + "The flight's expected departure time is: "
        + scheduledDepartureTime + ", "
        + "and the scheduled boarding time is: "
        + scheduledBoardingTime
        + ". Always convert from the timezone given in the departure and boarding times to the timezone of the departure location.";

        instruction = "In the style of a " + announcementPersonality + ", " + "Write a script for a very brief announcement that the gate has now closed, and passengers that have missed their flight should visit the customer service deck. Don't introduce yourself. When mentioning the flight number, only mention airline name followed by the number portion as individual digits, not the letters. Never say the icao codes directly, always say the actual city name. Keep the announcement short, and to the point. Don't use too many extra adjectives or other fluff words.";
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
        try {        ResponseEntity<Map> openAiResponse = restTemplate.postForEntity(openAiUrl, entity, Map.class);
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

        HttpEntity<Map<String, Object>> ttsEntity = new HttpEntity<>(ttsRequestBody, headers);
        String ttsUrl = "https://api.openai.com/v1/audio/speech";
        try {
        ResponseEntity<byte[]> ttsResponse = restTemplate.postForEntity(ttsUrl, ttsEntity, byte[].class);
            // Construct the response object
            apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI TTS API Call - Status: ")
                 .append(ttsResponse.getStatusCode())
                 .append("\n");
            if (ttsResponse.getStatusCode().is2xxSuccessful() && ttsResponse.getBody() != null) {
                byte[] audioData = ttsResponse.getBody();

                // Encode audio data to Base64 string
                String base64Audio = Base64.getEncoder().encodeToString(audioData);


           // Create a response map
    Map<String, Object> responseBody = new HashMap<>();
    responseBody.put("base64Audio", base64Audio); // Encoded audio
    responseBody.put("apiCallLog", apiCallStatus.toString()); // API Call Log

    return ResponseEntity.ok(responseBody); // Send back as JSON
        } else {
            // Handle error case
        // Since it's an error condition, construct a JSON response
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", apiCallStatus + "\nOpenAI TTS Call: Failed to generate audio from the text");
        return ResponseEntity.status(ttsResponse.getStatusCode()).body(new MapResource(errorResponse));
        }
    } catch (HttpClientErrorException e) {
        // This will catch client errors like 401 Unauthorized and provide more details
        apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI TTS API Call - HttpClient Error: ")
                     .append(e.getStatusCode())
                     .append(" - ")
                     .append(e.getResponseBodyAsString())
                     .append("\n");
    }catch (Exception e) {
        apiCallStatus.append(getCurrentUtcDateTime()).append(" - OpenAI TTS API Call - Error: ")
                 .append(e.getMessage())
                 .append("\n");
    }
    } else {
        // Handle the case where weather API call was not successful or body is null
        apiCallStatus.append(getCurrentUtcDateTime()).append(" - Weather API Call - Failed or no data received\n");
    }
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiCallStatus + "\ninternal server error");
    
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