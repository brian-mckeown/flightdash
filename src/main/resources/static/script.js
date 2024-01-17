/**************************** */
/*** ANGULAR JS SECTION BELOW */
/**************************** */
var app = angular.module('checklistApp', []);

app.controller('ChecklistController', ['$scope', '$sce', '$timeout', '$http', '$document', '$interval', function($scope, $sce, $timeout, $http, $document, $interval) {
    

    $scope.versionNumber = '1.5.0'; 

    $scope.state = 'Idle';
    $scope.messages = [];
    $scope.selectedChecklist = '';
    $scope.icao = '';
    $scope.simbriefPilotId = '';
    $scope.simbriefIdVisible = false;
    $scope.openAiApiKey = '';
    $scope.openAiKeyVisible = false;
    $scope.flightPlanData = '';
    $scope.flightPlanJSONData = '';
    $scope.flightPlanTrustedHtml = '';
    $scope.airportData = {};
    $scope.airportInfo = {};
    $scope.savedConfigData = {};
    $scope.defaultChecklists = {};
    $scope.announcementApiReport = '';
    $scope.announcementsReady = false;

    $scope.announcementCheckboxes = [
        { id: 'policyAgreement', label: 'I have read and agree to the OpenAI Usage Policy.', checked: false },
        { id: 'costResponsibility', label: 'I understand that all costs incurred via OpenAI are my responsibility, regardless of FlightDash.io\'s cost estimation accuracy. I do not hold FlightDash.io (including developers, members, affiliates, etc.) accountable for any costs incurred.', checked: false },
        { id: 'betaUnderstanding', label: 'I understand that this is an Open Beta feature and may not always work as expected.', checked: false },
        { id: 'apiKeyAdded', label: 'I\'ve added my OpenAI API Key in the Configuration Settings.', checked: false },
        { id: 'flightDataCheck', label: 'I\'ve ensured that all Flight Data and Flight Crew are generated in the Flight Data section of FlightDash.io (no fields are empty).', checked: false }
    ];

    function updateAnnouncementsReady() {
        $scope.announcementsReady = $scope.announcementCheckboxes.every(function(checkbox) {
            return checkbox.checked;
        });
    }

    $scope.$watch('announcementCheckboxes', updateAnnouncementsReady, true);
    

    $scope.audioSrc = '';
    
    $scope.runways = '';
    $scope.frequencies = '';

    $scope.metarSource='aviationweather_gov';

    $scope.airportRequested = false;

    $scope.windSpeed = 0;
    $scope.windDirection = 0;

    $scope.currentSubRowIndex = -1;

    $scope.handleKeyPress = function(event) {
        switch (event.key.toLowerCase()) {
            case 'a':
                $scope.handleButtonPress('A');
                break;
            case 'b':
                $scope.handleButtonPress('B');
                break;
            case 'c':
                $scope.handleButtonPress('C');
                break;
            case 'd':
                $scope.handleButtonPress('D');
                break;
            default:
                // handle other keys if necessary
                break;
        }
        $scope.$apply();
    };

    $document.bind('keydown', $scope.handleKeyPress);

    // Cleanup listener when scope is destroyed
    $scope.$on('$destroy', function() {
        $document.unbind('keydown', $scope.handleKeyPress);
    });

    $scope.setState = function(newState) {
        $scope.state = newState;
    };

    $scope.sendMessage = function(event) {
        if (event && (event.keyCode !== 13 && event.which !== 13)) {
            return;
        }
        
        var timestamp = new Date().toLocaleTimeString();
        var trustedHtmlMessage = $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: " + $scope.chatMessage);
        $scope.speakText($scope.chatMessage);
        $scope.messages.push({ text: trustedHtmlMessage, color: '' });
        $scope.chatMessage = '';  // Clear the message box
        $scope.scrollToBottom(); // Scroll to the bottom after sending a message
    };

    $scope.scrollToBottom = function() {
        $timeout(function() {
            var chatContentDiv = document.getElementById('chat-content');
            chatContentDiv.scrollTop = chatContentDiv.scrollHeight;
        });
    };

    $scope.convertToUpperCase = function() {
        $scope.icao = $scope.icao.toUpperCase();
    };

    $scope.voices = [];
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = function() {
            $scope.voices = speechSynthesis.getVoices();
        };
    }

    $scope.speakText = function(message) {
        if ('speechSynthesis' in window) {
            var utterance = new SpeechSynthesisUtterance(message);
            utterance.volume = 1;  // 0 to 1
            utterance.rate = 0.9;    // 0.1 to 10
            utterance.pitch = 1;   // 0 to 2

            // Set the voice to Daniel en-GB
            var danielVoice = $scope.voices.find(voice => voice.name === 'Daniel' && voice.lang === 'en-GB');
            if (danielVoice) {
                utterance.voice = danielVoice;
            }

            window.speechSynthesis.speak(utterance);
        } else {
            alert("Your browser doesn't support speech synthesis.");
        }
    };

    //** Voice/Speech Recognition section **/
    $scope.isListening = false;
    $scope.preventRecognitionRestart = false;
    $scope.toggleMicrophone = function() {
        $scope.preventRecognitionRestart = false;
        $scope.isListening = !$scope.isListening;
    
        // If listening state is turned on
        if ($scope.isListening) {
            // Update the button style to active
            document.getElementById("microphoneButton").classList.remove('btn-outline-primary');
            document.getElementById("microphoneButton").classList.add('btn-primary');
        } else {
            // Update the button style to default
            document.getElementById("microphoneButton").classList.add('btn-outline-primary');
            document.getElementById("microphoneButton").classList.remove('btn-primary');
    
            // Stop the speech recognition (assuming you have a stop function in your service)
            $scope.stopSpeechRecognition();
        }
    };

    // Check for browser support
    if ('webkitSpeechRecognition' in window) {
        $scope.recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        $scope.recognition = new SpeechRecognition();
    } else {
        alert('Your browser does not support the Web Speech API. Please switch to Chrome or another supported browser.');
        return;
    }

    $scope.recognitionStarted = false; // initialize it to false

    $scope.startSpeechRecognition = function() {
        if ($scope.recognition && !$scope.recognitionStarted) {
            $scope.recognition.start();
            $scope.recognitionStarted = true; // Set the flag to true when recognition starts
        }
    };
    
    $scope.stopSpeechRecognition = function() {
        if ($scope.recognition && $scope.recognitionStarted) {
            $scope.recognition.stop();
            $scope.recognitionStarted = false; // Set the flag to false when recognition stops
        }
    };

    $scope.recognition.continuous = false; // We want to recognize one command at a time
    $scope.recognition.interimResults = false; // We only want the final result
    $scope.recognition.lang = 'en-US'; // Set to your preferred language

    $scope.recognitionSignalStarted = false; // Initialize the variable

    $scope.recognition.onstart = function() {
        console.log('Voice recognition started. Try speaking into the microphone.');
        $scope.$apply(function() {
            $scope.recognitionSignalStarted = true; // Show the red dot
        });
    };

    $scope.recognition.onerror = function(event) {
        console.error('Speech recognition error detected: ' + event.error);
    };

    $scope.recognition.onend = function() {
        console.log('Voice recognition ended.');
        $scope.recognitionStarted = false;
        $scope.$apply(function() {
            $scope.recognitionSignalStarted = false; // Hide the red dot
        });
    };

    $scope.recognition.onresult = function(event) {
        var last = event.results.length - 1;
        var command = event.results[last][0].transcript;
        $scope.processVoiceCommand(command.trim());
    };

    $scope.processVoiceCommand = function(command) {
        console.log("Recognized command:", command);
    
        var subRow = $scope.currentChecklist.subRows[$scope.currentSubRowIndex];
    
        if (command.includes(subRow.positive.toLowerCase()) || command.includes("check")) {
            $scope.scrollToBottom();
            $scope.handleButtonPress('A');
        } else if (subRow.neutral1 && command.includes(subRow.neutral1.toLowerCase())) { 
            // Only check if neutral1 is not empty
            $scope.scrollToBottom();
            $scope.handleButtonPress('B');
        } else if (subRow.neutral2 && command.includes(subRow.neutral2.toLowerCase())) {
            // Only check if neutral2 is not empty
            $scope.scrollToBottom();
            $scope.handleButtonPress('C');
        } else if (command.includes(subRow.cancel.toLowerCase())) {
            $scope.scrollToBottom();
            $scope.handleButtonPress('D');
        }
    };
    
    //**End speech voice recognition section  */


    $scope.handleChecklistButtonPress = function(checklist) {
        var message = checklist.checklist + " checklist";
        $scope.chatMessage = message;  // Assign the message to chatMessage
        $scope.sendMessage();  // Send the message
        $scope.currentChecklist = checklist;  // Store current checklist
        $scope.currentSubRowIndex = 0;  // Start from the first subRow
        // Start the voice recognition later, after the first item of the checklist is read out.
        $timeout(function() {
            $scope.processSubRow();
        }, 2000);
    };

    $scope.processSubRow = function() {
        if ($scope.currentSubRowIndex >= 0 && $scope.currentSubRowIndex < $scope.currentChecklist.subRows.length) {
            var subRow = $scope.currentChecklist.subRows[$scope.currentSubRowIndex];
    
            // Send the prompt
            $scope.chatMessage = subRow.prompt;
            $scope.sendMessage();
    
            // Send the 'positive' option
            $scope.chatMessage = "A - " + subRow.positive;
            var trustedHtmlMessage = $sce.trustAsHtml("<span style='color:green'>" + $scope.chatMessage + "</span>");
            $scope.messages.push({ text: trustedHtmlMessage, color: '' });
    
            // Send the 'neutral1' option
            $scope.chatMessage = "B - " + subRow.neutral1;
            trustedHtmlMessage = $sce.trustAsHtml("<span style='color:orange'>" + $scope.chatMessage + "</span>");
            $scope.messages.push({ text: trustedHtmlMessage, color: '' });
    
            // Send the 'neutral2' option
            $scope.chatMessage = "C - " + subRow.neutral2;
            trustedHtmlMessage = $sce.trustAsHtml("<span style='color:orange'>" + $scope.chatMessage + "</span>");
            $scope.messages.push({ text: trustedHtmlMessage, color: '' });
    
            // Send the 'cancel' option
            $scope.chatMessage = "D - " + subRow.cancel;
            trustedHtmlMessage = $sce.trustAsHtml("<span style='color:red'>" + $scope.chatMessage + "</span>");
            $scope.messages.push({ text: trustedHtmlMessage, color: '' });
    
            // Clear the chatMessage to make sure the message box is ready for user input
            $scope.chatMessage = '';  
            $scope.scrollToBottom(); // Ensure the messages are scrolled to the bottom
            
            // Start voice recognition after a delay (e.g., 2 seconds after displaying the last option)
            setTimeout(function() {
            if ($scope.isListening) {
                $scope.recognition.start();
            }
            }, 2000);
            $scope.scrollToBottom();
        } else if ($scope.currentSubRowIndex === $scope.currentChecklist.subRows.length) {
            // All sub-rows are complete. Announce the checklist completion.
            var completionMessage = $scope.currentChecklist.checklist + " checklist complete.";
            $scope.chatMessage = completionMessage;
            $scope.sendMessage();
            // Set the flag to true to prevent automatic restarting of recognition
            $scope.preventRecognitionRestart = true;
            $scope.stopSpeechRecognition();
        }
    };    

    $scope.handleButtonPress = function(button) {
        if ($scope.currentSubRowIndex >= 0 && $scope.currentSubRowIndex < $scope.currentChecklist.subRows.length) {
            var subRow = $scope.currentChecklist.subRows[$scope.currentSubRowIndex];
            var color = '';
            var message = '';
            
            // Define timestamp here
            var timestamp = new Date().toLocaleTimeString();
    
            switch (button) {
                case 'A':
                    message = subRow.positive;
                    color = 'green';
                    $scope.currentSubRowIndex++;  // Move to next subRow
                    break;
                case 'B':
                    message = subRow.neutral1;
                    color = 'orange';
                    break;
                case 'C':
                    message = subRow.neutral2;
                    color = 'orange';
                    break;
                case 'D':
                    message = subRow.cancel;
                    color = 'red';
                    $scope.currentSubRowIndex = -1;  // Exit the loop
                    break;
            }
    
            // Print the message
            $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: <span style='color:" + color + "'>" + message + "</span>"), color: color });
            
            // Speak the message
            $scope.speakText(message);
    
            // Use setTimeout for delay, and wrap the inside code with $scope.$apply() to ensure AngularJS digest cycle recognizes the changes
            if (button === 'A') {
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.processSubRow();  // Process next subRow if 'A' is pressed
                        $scope.speakText($scope.chatMessage); // Speak the next message
                        
                        // Start the voice recognition here if the microphone button is enabled.
                        setTimeout(function() {
                            if ($scope.isListening && $scope.currentSubRowIndex !== $scope.currentChecklist.subRows.length) {
                                $scope.startSpeechRecognition();
                            }
                        }, 2000);  // 2-second delay
                    });
                }, 2000);  // 2-second delay
            }
            $scope.scrollToBottom();
        }
    };
    

    $scope.parseMetar = function(metarText) {
        const parts = metarText.split(' ');
    
        $scope.metarIcao = parts[0];
        $scope.metarDateTime = parts[1];
    
        // Convert UTC timestamp to local date and time
        const utcDate = new Date(Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            parseInt($scope.metarDateTime.substring(0, 2)),
            parseInt($scope.metarDateTime.substring(2, 4)),
            parseInt($scope.metarDateTime.substring(4, 6))
        ));
    
        // Fetch the local timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Format the UTC date to a local string with timezone
        $scope.localDateTime = utcDate.toLocaleString("en-US", { timeZoneName: "short" }) + " (" + timezone + ")";
    
        let index = 2; // Starting from wind or AUTO
    
        while (parts[index] === "AUTO" || parts[index] === "COR") {
            index++; // Skip special terms
        }
    
        $scope.metarWind = parts[index++];
        $scope.metarVisibility = parts[index++];
    
        $scope.metarWeather = "";
        while (index < parts.length && !parts[index].match(/^(SKC|CLR|FEW|SCT|BKN|OVC|\d{2}\/\d{2}|A\d{4}|Q\d{4}|RMK)/)) {
            $scope.metarWeather += parts[index++] + " ";
        }
    
        $scope.metarClouds = "";
        while (index < parts.length && parts[index].match(/^(SKC|CLR|FEW|SCT|BKN|OVC)/)) {
            $scope.metarClouds += parts[index++] + " ";
        }
    
        if (parts[index].match(/M?\d{2}\/M?\d{2}/)) {
            $scope.metarTemperatureDewpoint = parts[index++];
        }
    
        if (parts[index].match(/^(A|Q)\d{4}/)) {
            $scope.metarAltimeter = parts[index++];
        }
    
        // The remaining parts are treated as remarks
        $scope.metarRemarks = parts.slice(index).join(' ');
    };
    

    $scope.convertCelsiusToFahrenheit = function(celsius) {
        if (celsius === null || celsius === undefined) return null;
        
        // Check for 'M' which denotes a negative temperature in METAR
        if (celsius.charAt(0) === 'M') {
            // Convert the rest of the string (after 'M') into a negative number
            celsius = -parseFloat(celsius.substring(1));
        } else {
            // Convert string to number normally if no 'M' is present
            celsius = parseFloat(celsius);
        }
        
        return (celsius * 9/5) + 32;
    };
    
    //Runway Wind Calculations
    // Compute and return the offset angle between wind direction and runway heading
    $scope.getOffsetAngle = function(runwayHeading, windDirection) {
        if (isNaN(runwayHeading) || isNaN(windDirection)) {
            console.error("Invalid runway heading or wind direction:", runwayHeading, windDirection);
            return 0; // or another default value
        }
    
        let offset = windDirection - runwayHeading;
        if (offset < 0) offset += 360;  // Adjust for negative offsets
        return Math.min(offset, 360 - offset);  // Ensure the angle is between 0 and 180
    };
    
    $scope.getHeadwind = function(runwayHeading, windSpeed, windDirection) {
        let offsetAngle = $scope.getOffsetAngle(runwayHeading, windDirection);
        let offsetAngleRad = offsetAngle * (Math.PI / 180);  // Convert to radians
        let headwindValue = windSpeed * Math.cos(offsetAngleRad);
        return parseFloat(headwindValue.toFixed(1));  // Rounded to 1 decimal place and parsed back to float
    };
    
    $scope.getCrosswind = function(runwayHeading, windSpeed, windDirection) {
        let offsetAngle = $scope.getOffsetAngle(runwayHeading, windDirection);
        let offsetAngleRad = offsetAngle * (Math.PI / 180);  // Convert to radians
        let crosswindValue = windSpeed * Math.sin(offsetAngleRad);
        return parseFloat(crosswindValue.toFixed(1));  // Rounded to 1 decimal place and parsed back to float
    };
    
    $scope.getCrosswindDirection = function(runwayHeading, windDirection) {
        let diff = windDirection - runwayHeading;
        
        // Normalize the difference to the range [-180, 180]
        while (diff > 180) diff -= 360;
        while (diff <= -180) diff += 360;
    
        return (diff > 0) ? 'from the right' : 'from the left';
    };
    

$scope.getHeading = function(end, runway) {
    return (end === runway.le_ident) ? runway.le_heading_degT : runway.he_heading_degT;
};

$scope.sortRunwaysByHeadwind = function() {
    // Parsing wind direction and speed from $scope.metarWind
    $scope.windDirection = parseInt($scope.metarWind.substring(0, 3));
    $scope.windSpeed = parseInt($scope.metarWind.substring(3, $scope.metarWind.length - 2)); // Assuming 'KT' is always at the end

    // Calculating headwind for each runway and storing in the same object for later sorting
    for(let runway of $scope.airportData.runways) {
        runway.le_headwind = $scope.getHeadwind(runway.le_heading_degT, $scope.windSpeed, $scope.windDirection);
        runway.he_headwind = $scope.getHeadwind(runway.he_heading_degT, $scope.windSpeed, $scope.windDirection);
    }

    // Sorting runways by highest headwind (You might adjust this if you split le and he runways)
    $scope.airportData.runways.sort((a, b) => {
        return Math.max(b.le_headwind, b.he_headwind) - Math.max(a.le_headwind, a.he_headwind);
    });
};

$scope.sortRunwaysForDisplay = function() {
    let flattenedRunways = $scope.getFlattenedRunways();
    
    $scope.flattenedRunways = flattenedRunways.sort((a, b) => {
        let aHeadwind = $scope.getHeadwind(a.heading_degT, $scope.windSpeed, $scope.windDirection);
        let bHeadwind = $scope.getHeadwind(b.heading_degT, $scope.windSpeed, $scope.windDirection);

        let aCrosswind = Math.abs($scope.getCrosswind(a.heading_degT, $scope.windSpeed, $scope.windDirection));
        let bCrosswind = Math.abs($scope.getCrosswind(b.heading_degT, $scope.windSpeed, $scope.windDirection));

        // Classify each runway
        let aClass = aHeadwind > 0 ? (aHeadwind > aCrosswind ? "green" : "yellow") : "red";
        let bClass = bHeadwind > 0 ? (bHeadwind > bCrosswind ? "green" : "yellow") : "red";

        // If they belong to the same class, then compare based on specific class criteria
        if (aClass === bClass) {
            switch (aClass) {
                case "green":
                    return bHeadwind - aHeadwind; // Highest headwind first
                case "yellow":
                    return aCrosswind - bCrosswind; // Smallest crosswind first
                case "red":
                    return bHeadwind - aHeadwind; // Least negative (or most positive) headwind first
            }
        }

        // Otherwise, order by class: green > yellow > red
        return (aClass === "green" ? 0 : (aClass === "yellow" ? 1 : 2)) - 
               (bClass === "green" ? 0 : (bClass === "yellow" ? 1 : 2));
    });
};


$scope.getCardHeaderColor = function(runway, ident) {
    const heading = (ident === runway.le_ident) ? runway.le_heading_degT : runway.he_heading_degT;
    const headwind = $scope.getHeadwind(heading, $scope.windSpeed, $scope.windDirection);
    const crosswind = $scope.getCrosswind(heading, $scope.windSpeed, $scope.windDirection);
    
    if (headwind > 0) {
        if (headwind > crosswind) {
            return 'success'; // green
        } else {
            return 'warning'; // yellow/orange
        }
    } else {
        return 'danger'; // red
    }
};

$scope.updateRunwayData = function() {
    $scope.sortRunwaysByHeadwind();
    $scope.sortRunwaysForDisplay();
};

$scope.getFlattenedRunways = function() {
    let flattened = [];
    for(let runway of $scope.airportData.runways) {
        flattened.push({
            ident: runway.le_ident,
            heading_degT: runway.le_heading_degT,
            ils: runway.le_ils,  // <-- Adjusted here
            ...runway // Spread the rest of the properties
        });
        flattened.push({
            ident: runway.he_ident,
            heading_degT: runway.he_heading_degT,
            ils: runway.he_ils,  // <-- Adjusted here
            ...runway // Spread the rest of the properties
        });
    }
    return flattened;
};
    
/*Checklist Editor Code*/
    $scope.tables = [{
        name: 'Preflight',
        rows: []
    },
    {
        name: 'Taxi',
        rows: []
    },
    {
        name: 'In-flight',
        rows: []
    },
    {
        name: 'Landing',
        rows: []
    },
    {
        name: 'After-landing',
        rows: []
    },
    {
        name: 'Emergency',
        rows: []
    }
];

$scope.addRow = function(table) {
    table.rows.push({
        checklist: '',
        subRows: [],
        expanded: false
    });
};

$scope.removeRow = function(table, index) {
    table.rows.splice(index, 1);
};

$scope.addSubRow = function(row) {
    row.subRows.push({
        prompt: '',
        positive: 'Check',
        neutral1: '',
        neutral2: '',
        cancel: 'Cancel'
    });
};

$scope.removeSubRow = function(row, index) {
    row.subRows.splice(index, 1);
};

$scope.updateSelectedChecklistBundle = function() {
    // Find the selected checklist by its bundleName in the defaultChecklists array
    var selected = $scope.defaultChecklists.find(function(checklist) {
        return checklist.bundleName === $scope.selectedChecklist;
    });
    
    // If a matching checklist is found, update tables and bundleName
    if (selected) {
        $scope.tables = selected.tables;
        $scope.bundleName = selected.bundleName;
    }
};

$scope.saveConfig = function() {
        // Building the object conditionally
        var dataToSave = {};

        if($scope.metarSource) dataToSave.metarSource = $scope.metarSource;
        if($scope.simbriefPilotId) dataToSave.pilotId = $scope.simbriefPilotId;
        if($scope.openAiApiKey) dataToSave.openAiApiKey = $scope.openAiApiKey;
        if($scope.bundleName) dataToSave.bundleName = $scope.bundleName;
        if($scope.tables) dataToSave.tables = angular.copy($scope.tables);
        
        // Convert the object to a string
        var jsonString = JSON.stringify(dataToSave, null, 4);
    
        // Create a blob of the data
        var blob = new Blob([jsonString], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        
        // Create a link element, use it to download the blob, and revoke the URL
        var a = document.createElement('a');
        a.download = 'flightdash-config.json';
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
};

$scope.importConfig = function(inputElement) {
    var file = inputElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var contents = event.target.result;
            try {
                var jsonData = JSON.parse(contents);
                $scope.$apply(function() {
                    // Clear existing values
                    $scope.clearConfigValues();

                    // Set new values from JSON
                    $scope.metarSource = jsonData.metarSource;
                    $scope.simbriefPilotId = jsonData.pilotId;
                    $scope.openAiApiKey = jsonData.openAiApiKey;
                    $scope.bundleName = jsonData.bundleName;
                    $scope.tables = jsonData.tables;
                });
            } catch (e) {
                console.error("Failed to parse JSON.", e);
            }
        };
        reader.readAsText(file);
    }
};

$scope.clearConfigValues = function() {
    $scope.metarSource = '';
    $scope.simbriefPilotId = '';
    $scope.bundleName = '';
    $scope.tables = [];
};

//** Flight Status Section */
// Default values for the badges
$scope.aircraftName = '';
$scope.callSign = '';
$scope.departureIcao = '';
$scope.arrivalIcao = '';
$scope.flightLevelString = '';
$scope.airline = '';
$scope.flightCrewArray = [];
$scope.showFlightStatBanner = false;
$scope.showPassengersBanner = false;
$scope.currentFlightStatus = 'Idle';
$scope.finalArrivalStatus = '';
$scope.scheduledBoardingDateTime = '';
$scope.scheduledDepartureDateTime = '';
$scope.estimateArrivalDateTime = '';
$scope.estimateGateArrivalDateTime = '';
$scope.actualBoardingDateTime = '';
$scope.actualDepartedDateTime = '';
$scope.actualArrivalDateTime = '';
$scope.actualGateArrivalDateTime = '';

$scope.generateFlightCrew = function() {
    // Empty the flightCrewArray before generating new crew members
    $scope.flightCrewArray.length = 0;
        
    // Generate a flight crew member for each position
    positions.forEach(function(position) {
        var gender = Math.random() > 0.5 ? 'male' : 'female';
        var firstNameArray = gender === 'male' ? maleFirstNames : femaleFirstNames;
        var firstName = firstNameArray[Math.floor(Math.random() * firstNameArray.length)];
        var lastName = $scope.lastNames[Math.floor(Math.random() * $scope.lastNames.length)];
        var voiceOptions = (position === 'Captain' && gender === 'male') ? ['onyx'] : 
                            (gender === 'male' ? ['echo', 'fable'] : ['alloy', 'nova', 'shimmer']);
        var voice = voiceOptions[Math.floor(Math.random() * voiceOptions.length)];
        
        // Create the crew member object
        var crewMember = {
            firstName: firstName,
            lastName: lastName,
            position: position,
            gender: gender,
            voice: voice
        };
        
        // Add the crew member to the array
        $scope.flightCrewArray.push(crewMember);
    });
    console.log($scope.flightCrewArray);
}


$scope.setFlightStatus = function(status) {
    $scope.currentFlightStatus = status;

    let currentTimestamp = new Date().toISOString();

    switch(status) {
        case 'Boarding':
            $scope.actualBoardingDateTime = currentTimestamp;
            break;
        case 'Departed':
            $scope.actualDepartedDateTime = currentTimestamp;
            break;
        case 'Landed':
            $scope.actualArrivalDateTime = currentTimestamp;
            break;
        case 'Arrived':
            $scope.actualGateArrivalDateTime = currentTimestamp;
            if ($scope.arrivalStatus === 'ON TIME') {
                $scope.finalArrivalStatus = 'ON TIME';
            } else if ($scope.arrivalStatus === 'DELAYED') {
                $scope.finalArrivalStatus = 'DELAYED';
            }
            break;
        case 'Idle':
            $scope.actualBoardingDateTime = '';
            $scope.actualDepartedDateTime = '';
            $scope.actualArrivalDateTime = '';
            $scope.actualGateArrivalDateTime = '';
            break;
        default:
            break;
    }
};

$scope.getDifference = function(scheduled, actual) {

    if (!scheduled || !actual) {
        return '--';
    }
    var scheduledDateLocal = new Date(scheduled); 
    var actualDateLocal = new Date(actual); 

    var diff = (actualDateLocal - scheduledDateLocal) / (1000 * 60); // difference in minutes

    diff = Math.round(diff); // Round to nearest minute

    var isNegative = diff < 0;
    diff = Math.abs(diff); // Always work with positive values for calculation

    var hours = Math.floor(diff / 60);
    var minutes = diff % 60;

    // Format the output with a negative sign if the actual time is before the scheduled time
    var formattedDifference = hours + 'h ' + minutes + 'm';
    if (isNegative) {
        formattedDifference = '-' + formattedDifference;
    }
    return formattedDifference;
};

$scope.getDifferenceStyle = function(scheduled, actual) {
    var scheduledDate = new Date(scheduled);
    var actualDate = new Date(actual);
    var diff = (actualDate - scheduledDate) / (1000 * 60); // difference in minutes
    
    if (diff <= 0) {
        return {color: 'green'};
    } else {
        return {color: 'red'};
    }
};

$scope.updateBoardingCountdown = function() {
    var now = new Date();
    var scheduledDate = new Date($scope.scheduledBoardingDateTime);
    var diff = scheduledDate - now;

    var totalSeconds = Math.floor(diff / 1000);
    $scope.boardingHours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    $scope.boardingMinutes = Math.floor(totalSeconds / 60);
    $scope.boardingSeconds = totalSeconds % 60;

    // If all components are non-positive, cap them at zero
    if ($scope.boardingHours <= 0 && $scope.boardingMinutes <= 0 && $scope.boardingSeconds <= 0) {
        $scope.boardingHours = 0;
        $scope.boardingMinutes = 0;
        $scope.boardingSeconds = 0;
    }

    // Set boardingStatus based on the time values
    if($scope.boardingHours === 0 && $scope.boardingMinutes === 0 && $scope.boardingSeconds === 0) {
        $scope.boardingStatus = "DELAYED";
    } else {
        $scope.boardingStatus = "ON TIME";
    }
};

$scope.updateDepartureCountdown = function() {
    var now = new Date();
    var scheduledDate = new Date($scope.scheduledDepartureDateTime);
    var diff = scheduledDate - now;

    var totalSeconds = Math.floor(diff / 1000);
    $scope.departureHours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    $scope.departureMinutes = Math.floor(totalSeconds / 60);
    $scope.departureSeconds = totalSeconds % 60;

    // If all components are non-positive, cap them at zero
    if ($scope.departureHours <= 0 && $scope.departureMinutes <= 0 && $scope.departureSeconds <= 0) {
        $scope.departureHours = 0;
        $scope.departureMinutes = 0;
        $scope.departureSeconds = 0;
    }

    // Set departureStatus based on the time values
    if($scope.departureHours === 0 && $scope.departureMinutes === 0 && $scope.departureSeconds === 0) {
        $scope.departureStatus = "DELAYED";
    } else {
        $scope.departureStatus = "ON TIME";
    }
};

$scope.updateLandingCountdown = function() {
    var now = new Date();
    var scheduledDate = new Date($scope.estimateArrivalDateTime);
    var diff = scheduledDate - now;

    var totalSeconds = Math.floor(diff / 1000);
    $scope.landingHours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    $scope.landingMinutes = Math.floor(totalSeconds / 60);
    $scope.landingSeconds = totalSeconds % 60;

    // If all components are non-positive, cap them at zero
    if ($scope.landingHours <= 0 && $scope.landingMinutes <= 0 && $scope.landingSeconds <= 0) {
        $scope.landingHours = 0;
        $scope.landingMinutes = 0;
        $scope.landingSeconds = 0;
    }

    // Set landingStatus based on the time values
    if($scope.landingHours === 0 && $scope.landingMinutes === 0 && $scope.landingSeconds === 0) {
        $scope.landingStatus = "DELAYED";
    } else {
        $scope.landingStatus = "ON TIME";
    }
};

$scope.updateArrivalCountdown = function() {
    var now = new Date();
    var scheduledDate = new Date($scope.estimateGateArrivalDateTime);
    var diff = scheduledDate - now;

    var totalSeconds = Math.floor(diff / 1000);
    $scope.arrivalHours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    $scope.arrivalMinutes = Math.floor(totalSeconds / 60);
    $scope.arrivalSeconds = totalSeconds % 60;

    // If all components are non-positive, cap them at zero
    if ($scope.arrivalHours <= 0 && $scope.arrivalMinutes <= 0 && $scope.arrivalSeconds <= 0) {
        $scope.arrivalHours = 0;
        $scope.arrivalMinutes = 0;
        $scope.arrivalSeconds = 0;
    }

    // Set arrivalStatus based on the time values
    if($scope.arrivalHours === 0 && $scope.arrivalMinutes === 0 && $scope.arrivalSeconds === 0) {
        $scope.arrivalStatus = "DELAYED";
    } else {
        $scope.arrivalStatus = "ON TIME";
    }
};




$interval(function() {
    $scope.updateBoardingCountdown();
    $scope.updateDepartureCountdown();
    $scope.updateLandingCountdown();
    $scope.updateArrivalCountdown();
}, 1000);

var countdownInterval = $interval(function() {
    $scope.updateBoardingCountdown();
    $scope.updateDepartureCountdown();
    $scope.updateLandingCountdown();
    $scope.updateArrivalCountdown();
}, 1000);

$scope.$on('$destroy', function() {
    $interval.cancel(countdownInterval);
});

$scope.$watch('showFlightStatBanner', function(newValue) {
    console.log('showFlightStatBanner changed to:', newValue);
});

$scope.$watch('showPassengersBanner', function(newValue) {
    console.log('showPassengersBanner changed to:', newValue);
});

$scope.updateStatus = function(dateTimeField) {
    // Get the current time
    let currentTime = new Date().toISOString();

    // Convert datetime-local input to ISO format for comparison
    let inputDateTime = new Date(dateTimeField).toISOString();

    if (inputDateTime < currentTime) {
        // If the input date-time is less than the current time, it's delayed
        return "Delayed";
    } else {
        return "On-Time";
    }
};

// Watch the Departure Date and Time input for changes
$scope.$watch('departureDateTime', function(newVal, oldVal) {
    if (newVal !== oldVal) {
        $scope.departureStatus = $scope.updateStatus(newVal);
    }
});

// Watch the Arrival Date and Time input for changes
$scope.$watch('arrivalDateTime', function(newVal, oldVal) {
    if (newVal !== oldVal) {
        $scope.arrivalStatus = $scope.updateStatus(newVal);
    }
});

// Watch the Calculated Boarding Date and Time field for changes
$scope.$watch('calculatedBoardingDateTime', function(newVal, oldVal) {
    if (newVal !== oldVal) {
        $scope.boardingStatus = $scope.updateStatus(newVal);
    }
});

// Add logic here to calculate and set the 'calculatedBoardingDateTime' based on the provided Departure Date-Time and Boarding Time in minutes
/** End Flight Status Section */

/*** PASSENGERS */
/** ************/
$scope.numberOfPassengers = 0; // initiate number of passengers to 0. 
$scope.firstNames = ["Carlos", "Cristian", "Katrina", "Alicia", "Candice", "Christian", "Carrie", "Nina", "Miguel", "Evan", "Adam", "Shelby", "Ann", "Jenny", "Kristy", "Rick", "Jared", "Carolyn", "Heidi", "Grant", "Christina", "James", "Megan", "Beth", "Brendan", "Charlene", "Rachel", "Kari", "Nichole", "Alan", "Sheryl", "Madison", "Ralph", "Tyler", "Carol", "Amber", "Kevin", "Hailey", "Hector", "Erin", "Lindsey", "Bryan", "Dylan", "Garrett", "Ronald", "Sharon", "Tina", "Sue", "Dorothy", "Kendra", "Barbara", "Nathan", "Xavier", "Teresa", "Kurt", "Mackenzie", "Kara", "Tabitha", "Roberta", "Janet", "Nancy", "Jay", "Tristan", "Jorge", "Anita", "Clarence", "Katherine", "Bailey", "Krista", "Jim", "Joseph", "Matthew", "Amanda", "Brianna", "Travis", "Elizabeth", "Ariel", "Jacob", "Maria", "Olivia", "Shelley", "Mindy", "Jeffery", "Seth", "Martin", "Jaime", "Gabriel", "Amy", "Christine", "Peter", "Anthony", "Tanner", "Briana", "Katie", "Tiffany", "Joshua", "Sierra", "Jeremy", "Annette", "Christopher", "Donald", "Bruce", "Jennifer", "Keith", "Tamara", "Bianca", "Tyrone", "Caleb", "Jerry", "Bobby", "Sabrina", "Jasmine", "Phillip", "Kenneth", "Cindy", "Jo", "Thomas", "Jeffrey", "Aimee", "Marcus", "Gina", "Molly", "Tammie", "Oscar", "Gerald", "Melissa", "Leonard", "Steven", "Sheila", "Leah", "Kayla", "Don", "Janice", "Holly", "Levi", "Casey", "Sonya", "Vanessa", "Corey", "Diana", "Frances", "Lynn", "Joyce", "Melanie", "Douglas", "Kathleen", "Connor", "Bonnie", "Ethan", "Nicole", "Richard", "Dillon", "Cassie", "Kaitlin", "Austin", "Hunter", "Gregory", "Vicki", "Julie", "Dana", "Cory", "Jillian", "Randy", "Isaiah", "Anna", "Meagan", "Francisco", "Zachary", "Alice", "Brandon", "Dean", "Krystal", "Glenda", "Manuel", "Kerri", "Lawrence", "Michael", "Sylvia", "Judith", "Judy", "Carla", "Kylie", "Autumn", "Kristie", "Candace", "Eric", "Justin", "Sean", "Marilyn", "Dakota", "Jesus", "Nathaniel", "Joanna", "Terry", "Philip", "Savannah", "Brandy", "Rachael", "Chris", "Ray", "Catherine", "Victor", "Jeff", "Laurie", "Scott", "Leslie", "Brandi", "Melinda", "Lauren", "Bridget", "Elaine", "Kathryn", "Ryan", "Brian", "Raymond", "Angel", "Clinton", "Derrick", "Margaret", "William", "Arthur", "Caitlin", "Devin", "Tara", "Andrew", "Donna", "Kyle", "Kellie", "Veronica", "Vincent", "Cole", "Pamela", "Debra", "Joan", "Clayton", "Steve", "Andres", "Dale", "Mathew", "Jimmy", "George", "Paige", "Laura", "Sandra", "Penny", "Bryce", "Johnny", "Patricia", "Brenda", "Melvin", "Tom", "Alyssa", "Dustin", "Michelle", "Spencer", "Shirley", "Evelyn", "Jerome", "Louis", "Ashley", "Fred", "Antonio", "Jaclyn", "Chase", "Meghan", "Renee", "Aaron", "Curtis", "Bethany", "Kristen", "Mason", "Julia", "Craig", "Misty", "Brooke", "Jon", "Theresa", "Allison", "Karen", "Roberto", "Raven", "Dawn", "Anne", "Jessica", "Cheyenne", "Luke", "Abigail", "Morgan", "Sally", "Marissa", "Deborah", "Alejandro", "Blake", "Billy", "Sandy", "Luis", "Whitney", "Loretta", "Gloria", "Jean", "Angelica", "Tami", "Karina", "Miranda", "Erika", "Jill", "Carl", "Cathy", "Angela", "Alexis", "Bradley", "Dennis", "Joe", "Stacey", "Rita", "Shane", "Latoya", "Devon", "Duane", "Robert", "Sonia", "Roy", "Jeanette", "Alex", "Emily", "Rhonda", "Kaitlyn", "Shannon", "Alexandria", "Jack", "Gail", "Darren", "Stephen", "Willie", "Valerie", "Mark", "Natasha", "Clifford", "Alexander", "Wesley", "Patrick", "Daniel", "Rose", "Tammy", "Courtney", "Theodore", "Howard", "Natalie", "Linda", "Kristina", "Jason", "Sarah", "Darryl", "Christy", "Lisa", "Frederick", "Kathy", "Darrell", "Cody", "Colleen", "Jacqueline", "Albert", "Troy", "Kelsey", "Deanna", "Wendy", "Barry", "Erik", "Suzanne", "Cynthia", "Hannah", "Marc", "Kerry", "Malik", "Guy", "Denise", "Pam", "Shawn", "Robin", "Ronnie", "Dalton", "Ruben", "Katelyn", "Sherri", "Brent", "Paul", "Samantha", "Monica", "Beverly", "Ellen", "Stanley", "Lindsay", "Tracy", "Andrea", "Jodi", "Ian", "Jesse", "Kelly", "Isabel", "Danny", "Sherry", "Lorraine", "Carly", "Mike", "Paula", "Jenna", "Virginia", "Susan", "Mary", "John", "Allen", "Sophia", "Sheri", "Charles", "Brett", "Kelli", "Darlene", "Gary", "Wanda", "Angie", "Martha", "Marie", "Betty", "Rodney", "Marisa", "Diane", "Juan", "Jose", "Monique", "Felicia", "Frank", "Nicholas", "Walter", "Tim", "Victoria", "Joel", "Kent", "Shelly", "Danielle", "Samuel", "Lee", "Kimberly", "Taylor", "Edward", "Edwin", "Cassandra", "Chad", "Destiny", "Yesenia", "Logan", "Kim", "Trevor", "Parker", "David", "Larry", "Henry", "Peggy", "Jamie", "Eugene", "Yolanda", "Haley", "Crystal", "Erica", "Lori", "Alexandra", "April", "Cheryl", "Randall", "Yvette", "Sergio", "Sara", "Tommy", "Brittany", "Harry", "Benjamin", "Stephanie", "Tracie", "Chelsea", "Mariah", "Edgar", "Jordan", "Heather", "Timothy", "Stacy", "Jonathan", "Brittney", "Connie", "Jake", "Vickie", "Dominic", "Daisy", "Todd", "Tony", "Gabriella", "Derek", "Kristin", "Rebecca", "Roger", "Debbie", "Javier"];
$scope.lastNames = ["Ross", "Cruz", "Berry", "Dawson", "Jarvis", "Christian", "Hinton", "Williams", "Horton", "Fuentes", "Cunningham", "Bullock", "White", "Hodges", "Hill", "Caldwell", "Ferguson", "Mendoza", "Rich", "Rhodes", "Medina", "Robertson", "Griffin", "Quinn", "Brewer", "Mack", "Villarreal", "Marshall", "Booth", "Schultz", "Fernandez", "Cabrera", "James", "Peters", "Mclean", "Mcdonald", "Mitchell", "Wilkerson", "Hudson", "Massey", "Murphy", "Sparks", "Hoover", "Sandoval", "Madden", "Lane", "Bryan", "Fitzgerald", "Swanson", "Blanchard", "Garrett", "Simmons", "Norman", "Richards", "Yu", "Vaughn", "Rivera", "Mccarthy", "Walters", "Rush", "Arroyo", "Peterson", "Stephens", "Powers", "Mcguire", "Mccormick", "Schaefer", "Forbes", "Bailey", "Warren", "Woodard", "Burke", "Johnston", "Stout", "Johns", "Wheeler", "Delgado", "Alvarado", "Avery", "Martin", "Finley", "Lin", "Baker", "Montoya", "Marquez", "Henderson", "Bird", "Jimenez", "Kaufman", "Moreno", "King", "Roberts", "Shepherd", "Adkins", "Hartman", "Garcia", "Ward", "Bates", "Gaines", "Thomas", "Cortez", "Estes", "Miller", "Harper", "Case", "Ruiz", "Gomez", "Ho", "Chapman", "Leonard", "Dickerson", "Reyes", "Gordon", "Maddox", "Cannon", "Mckee", "Burch", "Perkins", "Lester", "Casey", "Lambert", "Underwood", "Morales", "Joyce", "Lynn", "Ramirez", "Cordova", "Drake", "Vasquez", "Daniels", "Frazier", "Walker", "Mclaughlin", "Hutchinson", "Bowers", "Richard", "Munoz", "Dillon", "Bauer", "Riggs", "Austin", "Hunter", "Webb", "Valenzuela", "Romero", "Humphrey", "Cross", "Robles", "Castro", "Jensen", "Marsh", "Pineda", "Warner", "Hobbs", "Patterson", "Moran", "Zhang", "Davila", "Schmidt", "Mills", "Decker", "Dean", "Coleman", "Franco", "Butler", "Wagner", "Pollard", "Lawrence", "Michael", "Davies", "Hughes", "Valentine", "Meyer", "Kelley", "Morris", "Vargas", "Estrada", "Perez", "Brennan", "Kline", "Stevens", "Sullivan", "Hardy", "Yang", "Whitaker", "Reed", "Riddle", "Kennedy", "Gutierrez", "Terry", "Walsh", "Malone", "Wood", "Ray", "Robinson", "Rice", "Hoffman", "Foster", "Hebert", "Scott", "Wise", "Mcpherson", "Beard", "Sharp", "Johnson", "Ryan", "Chavez", "Perry", "Atkins", "Hodge", "Lewis", "Garrison", "Clark", "Mann", "Ramsey", "Simon", "Bell", "Alvarez", "Garza", "Odonnell", "Elliott", "Vincent", "Cole", "Arias", "Beck", "Reid", "Blankenship", "Irwin", "Weber", "Morse", "Chambers", "Higgins", "Hansen", "Sanchez", "Welch", "Saunders", "Olson", "Kirk", "Brown", "Long", "Cline", "Ortiz", "Greene", "Spencer", "Wall", "Fletcher", "Valencia", "Hawkins", "Chase", "Davidson", "Curtis", "Kirby", "Young", "Moore", "Watkins", "Fitzpatrick", "Craig", "Spears", "Conner", "Snyder", "Little", "Crane", "Burgess", "Golden", "Watson", "Steele", "Burns", "Aguilar", "Morgan", "Cooper", "Cox", "Blake", "Knight", "Duncan", "Banks", "Dunn", "Pugh", "Torres", "Bright", "Nicholson", "Montgomery", "Powell", "Williamson", "Brock", "Lyons", "Phillips", "Barnett", "Wade", "Brooks", "Gibbs", "Dennis", "Martinez", "Shah", "Adams", "Fritz", "Cherry", "Collier", "Hanson", "Patton", "Hopkins", "Hahn", "Gibson", "Hernandez", "Delacruz", "Rollins", "Boyer", "Leon", "Green", "Pruitt", "Barnes", "Stark", "Woods", "Pittman", "Webster", "Newton", "Bridges", "Vazquez", "Russell", "Barr", "Morrison", "Merritt", "Vaughan", "Herrera", "Cohen", "Benton", "Macdonald", "Mccoy", "Alexander", "Cervantes", "Navarro", "Silva", "Daniel", "Murillo", "Lawson", "Rose", "Calderon", "Howard", "Miles", "Howell", "Edwards", "Baldwin", "Vega", "Holmes", "Flores", "Jones", "Davis", "Harrison", "Doyle", "Colon", "Woodward", "Barry", "Porter", "Holland", "Ballard", "Rowe", "Flynn", "Terrell", "Hicks", "Fox", "Hall", "Hurst", "Pena", "Gillespie", "Chandler", "Li", "Oliver", "Anderson", "Fleming", "Atkinson", "Ware", "Harris", "Mcgee", "Simpson", "Carrillo", "Stanley", "Arnold", "Sanders", "Dominguez", "Carlson", "Tate", "Huber", "Castillo", "Ali", "Galvan", "Shaffer", "Stewart", "Meyers", "Reynolds", "Singh", "Avila", "Kelly", "Velazquez", "Murray", "Wright", "Strickland", "Wallace", "Diaz", "Dunlap", "Short", "Jackson", "Ramos", "Ayers", "Allen", "Gill", "Turner", "Boyd", "Smith", "Sherman", "Orozco", "Chen", "Rodriguez", "Pitts", "Wiggins", "Carroll", "Mcbride", "Hayes", "Velasquez", "West", "Stokes", "Le", "Fowler", "Frank", "Gilmore", "Lutz", "Abbott", "Freeman", "Rocha", "Contreras", "Carpenter", "Brady", "Graham", "Byrd", "Kent", "Kaiser", "Jenkins", "Deleon", "Parrish", "Hardin", "Clay", "Mcmillan", "Lucas", "Lee", "Payne", "Ritter", "Campbell", "Carr", "Thornton", "Taylor", "Rios", "Mccall", "Richardson", "Santiago", "Park", "Phelps", "Wilson", "Kerr", "Gilbert", "Huff", "Duffy", "Kim", "Parker", "Ball", "Franklin", "Dixon", "Nguyen", "Becker", "Buchanan", "Wells", "Evans", "Fuller", "Calhoun", "Collins", "Kidd", "Thompson", "Parsons", "Choi", "Pearson", "Hart", "Randall", "Burton", "Cook", "Gonzalez", "Larson", "Mullins", "Stone", "Lopez", "Willis", "Pace", "Oneal", "Jordan", "Nichols", "Nelson", "Bryant", "Todd", "Carter", "Bennett", "Mathews", "Combs", "Oconnor", "Harrington"];

/** Flight Crew names and positions*/
// Arrays of first names
var maleFirstNames = [
    'John', 'William', 'James', 'Charles', 'George', 'Frank', 'Joseph', 'Thomas', 'Henry', 'Robert',
    'Edward', 'Harry', 'Walter', 'Arthur', 'Fred', 'Albert', 'Samuel', 'David', 'Louis', 'Carl'
];
var femaleFirstNames = [
    'Mary', 'Anna', 'Emma', 'Elizabeth', 'Minnie', 'Margaret', 'Ida', 'Alice', 'Bertha', 'Sarah',
    'Annie', 'Clara', 'Ella', 'Florence', 'Cora', 'Martha', 'Laura', 'Nellie', 'Grace', 'Carrie'
];

// Array of positions
var positions = [
    'Captain', 'First Officer', 'Lead Flight Attendant', 'Flight Attendant 2', 'Flight Attendant 3',
    'Flight Attendant 4', 'Gate Attendant'
];

// Initializing the lists
$scope.passengersNotCheckedIn = [];
$scope.bagsNotCheckedIn = [];
$scope.passengersCheckedIn = [];
$scope.passengersBoarded = [];
$scope.passengersSeated = [];
$scope.passengersDeboarded = [];
$scope.bagsCheckedIn = [];
$scope.bagsLoaded = [];
$scope.bagsUnloaded = [];
$scope.bagsBaggageClaim = [];

$scope.resetPassengers = function() {
    $scope.passengersNotCheckedIn = [];
    $scope.bagsNotCheckedIn = [];
    $scope.passengersCheckedIn = [];
    $scope.passengersBoarded = [];
    $scope.passengersSeated = [];
    $scope.passengersDeboarded = [];
    $scope.bagsCheckedIn = [];
    $scope.bagsLoaded = [];
    $scope.bagsUnloaded = [];
    $scope.bagsBaggageClaim = [];
}

//create a seat label based on the passenger index
function createSeat(passengerIndex) {
    let row = Math.floor(passengerIndex / 6) + 1;
    let seatPosition = 'ABCDEF'.charAt(passengerIndex % 6);
    return row + seatPosition;
}

// Function to create manifest
$scope.createManifest = function(numberOfPassengers, scheduledBoardingDateTime) {
    for (let i = 0; i < numberOfPassengers; i++) {
        // Creating passenger name with random first and last names
        let randomFirstNameIndex = Math.floor(Math.random() * $scope.firstNames.length);
        let randomLastNameIndex = Math.floor(Math.random() * $scope.lastNames.length);
        let firstName = $scope.firstNames[randomFirstNameIndex];
        let lastName = $scope.lastNames[randomLastNameIndex];
        let passengerName = firstName + ' ' + lastName;

        // Assigning a seat
        let seat = createSeat(i);

        // Creating passenger object
        let passenger = {
            passengerId: i + 1,
            name: passengerName,
            seat: seat,
            status: 'Not Checked In',
            bags: Math.floor(Math.random() * 4) // Randomly 0, 1, 2, or 3
        };

        // Adding passenger to the not checked in list
        $scope.passengersNotCheckedIn.push(passenger);

        // Creating bags if any
        for (let b = 0; b < passenger.bags; b++) {
            let bag = {
                passengerId: passenger.passengerId,
                status: 'Not Checked In'
            };
            $scope.bagsNotCheckedIn.push(bag);
        }
    }
    // After all passengers and bags are created, iterate through passengers to assign bags
    $scope.passengersNotCheckedIn.forEach(passenger => {
        passenger.bagsArray = $scope.bagsNotCheckedIn.filter(bag => bag.passengerId === passenger.passengerId);
    });

    // Calculate the time until boarding in milliseconds
    var timeUntilBoarding = moment(scheduledBoardingDateTime).diff(moment(), 'milliseconds');
    var checkInIntervalTime = timeUntilBoarding / numberOfPassengers;

    // Function to move a random passenger and their bags to checked in
    function checkInRandomPassenger() {
        if ($scope.passengersNotCheckedIn.length > 0) {
            // Select a random passenger from not checked in list
            var randomIndex = Math.floor(Math.random() * $scope.passengersNotCheckedIn.length);
            var passenger = $scope.passengersNotCheckedIn.splice(randomIndex, 1)[0];
            passenger.status = 'Checked In';
            $scope.passengersCheckedIn.push(passenger);

            // Find and move the passenger's bags
            var passengerBags = $scope.bagsNotCheckedIn.filter(bag => bag.passengerId === passenger.passengerId);
            passengerBags.forEach(bag => {
                bag.status = 'Checked In';
                // Remove from not checked in list
                var index = $scope.bagsNotCheckedIn.indexOf(bag);
                $scope.bagsNotCheckedIn.splice(index, 1);
                // Add to checked in list
                $scope.bagsCheckedIn.push(bag);
            });
        } else {
            // Cancel the interval if no passengers are left to check in
            $interval.cancel(checkInPassengerInterval);
        }
    }

    // Set up the interval to check in passengers at random
    var checkInPassengerInterval = $interval(checkInRandomPassenger, checkInIntervalTime);

    // Make sure to cancel the interval when the scope is destroyed
    $scope.$on('$destroy', function() {
        $interval.cancel(checkInPassengerInterval);
    });

};

$scope.boardPassengersAndBags = function() {
    var tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    var twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
    var passengerIntervalTime = tenMinutes / $scope.passengersCheckedIn.length;
    var bagIntervalTime = tenMinutes / $scope.bagsCheckedIn.length;

    // Function to board a random passenger
    var boardPassenger = function() {
        if ($scope.passengersCheckedIn.length > 0) {
            var randomIndex = Math.floor(Math.random() * $scope.passengersCheckedIn.length);
            var passenger = $scope.passengersCheckedIn.splice(randomIndex, 1)[0];
            passenger.status = 'Boarding';
            $scope.passengersBoarded.push(passenger);

            // Set a timeout to seat the passenger after 2 minutes
            $timeout(function() {
                passenger.status = 'Seated';
                var index = $scope.passengersBoarded.indexOf(passenger);
                $scope.passengersBoarded.splice(index, 1);
                $scope.passengersSeated.push(passenger);
            }, twoMinutes);
        }
    };

    // Function to load a random bag
    var loadBag = function() {
        if ($scope.bagsCheckedIn.length > 0) {
            var randomIndex = Math.floor(Math.random() * $scope.bagsCheckedIn.length);
            var bag = $scope.bagsCheckedIn.splice(randomIndex, 1)[0];
            bag.status = 'Loaded';
            $scope.bagsLoaded.push(bag);
        }
    };

    // Set intervals for boarding passengers and loading bags
    var passengerBoardingInterval = $interval(boardPassenger, passengerIntervalTime);
    var bagLoadingInterval = $interval(loadBag, bagIntervalTime);

    // Cancel intervals when all passengers are boarded and bags are loaded
    var checkIntervals = function() {
        if ($scope.passengersCheckedIn.length === 0) {
            $interval.cancel(passengerBoardingInterval);
        }
        if ($scope.bagsCheckedIn.length === 0) {
            $interval.cancel(bagLoadingInterval);
        }
    };

    // Regularly check if we need to cancel the intervals
    var checkIntervalsInterval = $interval(checkIntervals, 1000);

    // Make sure to cancel the intervals when the scope is destroyed
    $scope.$on('$destroy', function() {
        if (angular.isDefined(passengerBoardingInterval)) {
            $interval.cancel(passengerBoardingInterval);
        }
        if (angular.isDefined(bagLoadingInterval)) {
            $interval.cancel(bagLoadingInterval);
        }
        if (angular.isDefined(checkIntervalsInterval)) {
            $interval.cancel(checkIntervalsInterval);
        }
    });
};

$scope.quickBoardPassengersAndBags = function() {
    var tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    var twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
    var oneSecond = 1000; // 1 second in milliseconds
    var passengerIntervalTime = oneSecond / $scope.passengersCheckedIn.length;
    var bagIntervalTime = oneSecond / $scope.bagsCheckedIn.length;

    // Function to board a random passenger
    var boardPassenger = function() {
        if ($scope.passengersCheckedIn.length > 0) {
            var randomIndex = Math.floor(Math.random() * $scope.passengersCheckedIn.length);
            var passenger = $scope.passengersCheckedIn.splice(randomIndex, 1)[0];
            passenger.status = 'Boarding';
            $scope.passengersBoarded.push(passenger);

            // Set a timeout to seat the passenger after 2 minutes
            $timeout(function() {
                passenger.status = 'Seated';
                var index = $scope.passengersBoarded.indexOf(passenger);
                $scope.passengersBoarded.splice(index, 1);
                $scope.passengersSeated.push(passenger);
            }, oneSecond);
        }
    };

    // Function to load a random bag
    var loadBag = function() {
        if ($scope.bagsCheckedIn.length > 0) {
            var randomIndex = Math.floor(Math.random() * $scope.bagsCheckedIn.length);
            var bag = $scope.bagsCheckedIn.splice(randomIndex, 1)[0];
            bag.status = 'Loaded';
            $scope.bagsLoaded.push(bag);
        }
    };

    // Set intervals for boarding passengers and loading bags
    var passengerBoardingInterval = $interval(boardPassenger, passengerIntervalTime);
    var bagLoadingInterval = $interval(loadBag, bagIntervalTime);

    // Cancel intervals when all passengers are boarded and bags are loaded
    var checkIntervals = function() {
        if ($scope.passengersCheckedIn.length === 0) {
            $interval.cancel(passengerBoardingInterval);
        }
        if ($scope.bagsCheckedIn.length === 0) {
            $interval.cancel(bagLoadingInterval);
        }
    };

    // Regularly check if we need to cancel the intervals
    var checkIntervalsInterval = $interval(checkIntervals, 1000);

    // Make sure to cancel the intervals when the scope is destroyed
    $scope.$on('$destroy', function() {
        if (angular.isDefined(passengerBoardingInterval)) {
            $interval.cancel(passengerBoardingInterval);
        }
        if (angular.isDefined(bagLoadingInterval)) {
            $interval.cancel(bagLoadingInterval);
        }
        if (angular.isDefined(checkIntervalsInterval)) {
            $interval.cancel(checkIntervalsInterval);
        }
    });
};

$scope.deBoardPassengersAndBags = function() {
    var tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    var twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
    var passengerIntervalTime = tenMinutes / $scope.passengersSeated.length;
    var bagIntervalTime = tenMinutes / $scope.bagsLoaded.length;

    // Function to deboard passengers in order of their passengerId
    var deBoardPassenger = function() {
        if ($scope.passengersSeated.length > 0) {
            // Passengers are already sorted by passengerId so take the first one
            var passenger = $scope.passengersSeated.shift();
            passenger.status = 'Deboarded';
            $scope.passengersDeboarded.push(passenger);
        }
    };

    // Function to unload a random bag and move it to baggage claim after 2 minutes
    var unloadBag = function() {
        if ($scope.bagsLoaded.length > 0) {
            var randomIndex = Math.floor(Math.random() * $scope.bagsLoaded.length);
            var bag = $scope.bagsLoaded.splice(randomIndex, 1)[0];
            bag.status = 'Unloaded';
            $scope.bagsUnloaded.push(bag);

            // Set a timeout to move the bag to baggage claim after 2 minutes
            $timeout(function() {
                var index = $scope.bagsUnloaded.indexOf(bag);
                if (index !== -1) {
                    $scope.bagsUnloaded.splice(index, 1);
                }
                bag.status = 'Baggage Claim';
                $scope.bagsBaggageClaim.push(bag);
            }, twoMinutes);
        }
    };

    // Ensure passengers are sorted by passengerId
    $scope.passengersSeated.sort(function(a, b) {
        return a.passengerId - b.passengerId;
    });

    // Set intervals for deboarding passengers and unloading bags
    var passengerDeboardingInterval = $interval(deBoardPassenger, passengerIntervalTime);
    var bagUnloadingInterval = $interval(unloadBag, bagIntervalTime);

    // Cancel intervals when all passengers are deboarded and bags are unloaded
    var checkIntervals = function() {
        if ($scope.passengersSeated.length === 0) {
            $interval.cancel(passengerDeboardingInterval);
        }
        if ($scope.bagsLoaded.length === 0) {
            $interval.cancel(bagUnloadingInterval);
        }
    };

    // Regularly check if we need to cancel the intervals
    var checkIntervalsInterval = $interval(checkIntervals, 1000);

    // Make sure to cancel the intervals when the scope is destroyed
    $scope.$on('$destroy', function() {
        if (angular.isDefined(passengerDeboardingInterval)) {
            $interval.cancel(passengerDeboardingInterval);
        }
        if (angular.isDefined(bagUnloadingInterval)) {
            $interval.cancel(bagUnloadingInterval);
        }
        if (angular.isDefined(checkIntervalsInterval)) {
            $interval.cancel(checkIntervalsInterval);
        }
    });
};





    /*** API CALLS *****************/
    /**
     * 
     */
    $scope.fetchFlightPlan = function() {
        $http.get('/api/v1/flightplan/' + $scope.simbriefPilotId)
            .then(function(response) {
                // Handle the returned data here
                $scope.flightPlanData = response.data;
                if ($scope.flightPlanData && $scope.flightPlanData.text) {
                    $scope.flightPlanTrustedHtml = $sce.trustAsHtml($scope.flightPlanData.text.plan_html);
                }
            })
            .catch(function(error) {
                console.error('Error fetching flight plan:', error);
                
                // Display the toast with an error message
                displaySimbriefErrorToast();
            });
            $http.get('/api/v1/flightplan-json/' + $scope.simbriefPilotId)
            .then(function(response) {
                // Handle the returned data here
                $scope.flightPlanJSONData = response.data;
                $scope.aircraftName = $scope.flightPlanJSONData.aircraft.name;
                $scope.callSign = $scope.flightPlanJSONData.atc.callsign;
                $scope.departureIcao = $scope.flightPlanJSONData.origin.icao_code;
                $scope.arrivalIcao = $scope.flightPlanJSONData.destination.icao_code;
                $scope.flightLevelString = $scope.flightPlanJSONData.general.stepclimb_string;
                console.log("STEP FLIGHT LEVEL STRING: " + $scope.flightLevelString);

                $scope.numberOfPassengers = Number($scope.flightPlanJSONData.weights.pax_count);

                $scope.scheduledBoardingDateTime = moment.unix($scope.flightPlanJSONData.times.sched_out).subtract(30, 'minutes').toDate();
                $scope.scheduledDepartureDateTime = moment.unix($scope.flightPlanJSONData.times.sched_out).toDate();
                $scope.estimateArrivalDateTime = moment.unix($scope.flightPlanJSONData.times.est_on).toDate();
                $scope.estimateGateArrivalDateTime = moment.unix($scope.flightPlanJSONData.times.est_in).toDate();

            })
            .catch(function(error) {
                console.error('Error fetching flight plan:', error);
                
                // Display the toast with an error message
                displaySimbriefErrorToast();
            });
    };
    
    // Function to display a toast
    function displaySimbriefErrorToast() {
        var toastHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050; min-width: 300px;">
            <div class="toast-header">
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                Please check <strong>Settings</strong> and ensure your SimBrief Pilot ID is correct.
            </div>
        </div>`;
    
        var toastElement = angular.element(toastHTML);
        angular.element(document.body).append(toastElement);
    
        var toast = new bootstrap.Toast(toastElement[0]);
        toast.show();
    }

    $scope.fetchAirportInfo = function() {
        $http.get('/api/v1/airport/' + $scope.icao + '/' + $scope.metarSource)
            .then(function(response) {
                // Handle the returned data here
                $scope.airportData = response.data;
                $scope.airportInfo = {
                    name: $scope.airportData.name,
                    municipality: $scope.airportData.municipality,
                    icao: $scope.airportData.ident,
                    type: $scope.airportData.type,
                    metar: $scope.airportData.metar,
                    metarSource: $scope.airportData.metarSource,
                    wikipedia: $scope.airportData.wikipedia_link
                };
                
                $scope.runways = $scope.airportData.runways;
                $scope.frequencies = $scope.airportData.freqs;
                console.log($scope.airportData);
                console.log($scope.airportData.freqs);
                console.log($scope.airportData.runways);

                $scope.parseMetar($scope.airportInfo.metar);
                $scope.sortRunwaysByHeadwind();
                $scope.sortRunwaysForDisplay();
                $scope.updateRunwayData();
                $scope.airportRequested = true;
            })
            .catch(function(error) {
                console.error('Error fetching airport info:', error);
                
                // Display the toast with an error message
                displayAirportErrorToast();
            });
    };

    // Function to display a toast
    function displayAirportErrorToast() {
        var toastHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050; min-width: 300px;">
            <div class="toast-header">
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                Please check the <strong>ICAO</strong> and ensure it is correct. If correct, then this airport may not be available. 
            </div>
        </div>`;
    
        var toastElement = angular.element(toastHTML);
        angular.element(document.body).append(toastElement);
    
        var toast = new bootstrap.Toast(toastElement[0]);
        toast.show();
    }

    function displayChartsErrorToast() {
        var toastHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050; min-width: 300px;">
            <div class="toast-header">
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                There was an error retrieving the charts. It is possible that this airport is not supported by AviationAPI at this time.
            </div>
        </div>`;
    
        var toastElement = angular.element(toastHTML);
        angular.element(document.body).append(toastElement);
    
        var toast = new bootstrap.Toast(toastElement[0]);
        toast.show();
    }

    function displayVatsimErrorToast() {
        var toastHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1050; min-width: 300px;">
            <div class="toast-header">
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                There was an error retrieving the vatsim data. It is possible that this service is down. Please try again after a few minutes.
            </div>
        </div>`;
    
        var toastElement = angular.element(toastHTML);
        angular.element(document.body).append(toastElement);
    
        var toast = new bootstrap.Toast(toastElement[0]);
        toast.show();
    }

    $scope.fetchDefaultChecklists = function() {
        $http.get('/api/v1/default-checklists')
            .then(function(response) {
                // Handle the returned data here
                $scope.defaultChecklists = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching default checklist info:', error);
                
                // Display the toast with an error message
                displayAirportErrorToast();
            });
    };
    $scope.fetchDefaultChecklists();

    //Charts API call
    $scope.chartsData = {};
    $scope.chartsICAOplaceholder = '';
    $scope.fetchCharts = function() {
        $scope.chartsICAOplaceholder = $scope.icao;
        $http.post('/api/v1/charts', { icao: $scope.icao })
            .then(function(response) {
                // Handle the returned data here
                $scope.chartsData = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching charts data:', error);
                
                // Display the toast with an error message
                displayChartsErrorToast();
            });
    };

    //Vatsim API Call
    $scope.vatsimControllersData = [];
    $scope.vatsimArrivalsData = [];
    $scope.vatsimDeparturesData = [];
    $scope.vatsimAtisData = [];
    var vatsimFullData = {};
    
    $scope.fetchVatsim = function() {

        //clear arrays:
        $scope.vatsimControllersData = [];
        $scope.vatsimArrivalsData = [];
        $scope.vatsimDeparturesData = [];
        $scope.vatsimAtisData = [];
        vatsimFullData = [];

        $http.post('/api/v1/vatsim', { icao: $scope.icao})
            .then(function(response) {
                //Handle the returned data here
                vatsimFullData = response.data;
                // Loop through each pilot in the pilots array
                vatsimFullData.pilots.forEach(function(pilot) {
                    // Check for departure match
                    if (pilot.flight_plan && pilot.flight_plan.departure === $scope.icao) {
                        $scope.vatsimDeparturesData.push(pilot);
                    }

                    // Check for arrival match
                    if (pilot.flight_plan && pilot.flight_plan.arrival === $scope.icao) {
                        $scope.vatsimArrivalsData.push(pilot);
                    }
                });

                // Loop through each controller in the controllers array
                vatsimFullData.controllers.forEach(function(controller) {
                    // Check if the first 4 characters of callsign match $scope.icao
                    if (controller.callsign.substring(0, 4) === $scope.icao || controller.callsign.substring(0, 3) === $scope.icao.substring(1, 4)) {
                        $scope.vatsimControllersData.push(controller);
                    }
                });
                // Loop through each ATIS in the Atis array array
                vatsimFullData.atis.forEach(function(controller) {
                    // Check if the first 4 characters of callsign match $scope.icao
                    if (controller.callsign.substring(0, 4) === $scope.icao || controller.callsign.substring(0, 3) === $scope.icao.substring(1, 4)) {
                        $scope.vatsimAtisData.push(controller);
                    }
                });
                //Set each object to collapsed:
                $scope.vatsimControllersData.forEach(function(controller) {
                    controller.isCollapsed = true;
                });
            
                $scope.vatsimAtisData.forEach(function(atis) {
                    atis.isCollapsed = true;
                });
            
                $scope.vatsimDeparturesData.forEach(function(departure) {
                    departure.isCollapsed = true;
                });
            
                $scope.vatsimArrivalsData.forEach(function(arrival) {
                    arrival.isCollapsed = true;
                });
            })
            .catch(function(error) {
                console.error('Error fetching vatsim data:', error);
                
                // Display the toast with an error message
                displayVatsimErrorToast();
            });
    }

    $scope.selectedPdfUrl = null;
    $scope.activeChart = null;
    $scope.openPdf = function(pdfUrl, chartName) {
        $scope.selectedPdfUrl = $sce.trustAsResourceUrl(pdfUrl);
        $scope.activeChart = chartName;
    };


    $scope.playDingThenCallback = function(callback) {
        var dingAudio = document.getElementById('dingAudio');
        dingAudio.play();
        dingAudio.onended = function() {
            // Wait for 1 second after ding audio ends
            setTimeout(callback, 1000);
        };
    };

    $scope.isAnnouncementLoading = false;
    $scope.fetchAnnouncement = function(announcementType) {
        $scope.isAnnouncementLoading = true;

        var requestData = {
            openAiApiKey: $scope.openAiApiKey,
            flightCrewArray: $scope.flightCrewArray,
            airline: $scope.airline,
            flightNumber: $scope.callSign,
            currentDateTime: new Date().toISOString(), // Format the current date and time as ISO string
            departureIcao: $scope.departureIcao,
            arrivalIcao: $scope.arrivalIcao,
            arrivalTime: $scope.estimateGateArrivalDateTime,
            flightLevelString: $scope.flightLevelString,
            announcementType: announcementType,
            scheduledBoardingTime: $scope.scheduledBoardingDateTime,
            scheduledDepartureTime: $scope.scheduledDepartureDateTime,
            aircraftName: $scope.aircraftName
        };

        // Define the headers for your POST request
        var config = {
            headers : {
                'Content-Type': 'application/json'
            }
        };
        $http({
            method: 'POST',
            url: '/api/v1/announcements/universal',
            data: requestData,
            responseType: 'blob',  // Correct way to set the expected response type for binary data
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(function(response) {
            var blob = new Blob([response.data], { type: 'audio/mpeg' });
            $scope.audioSrc = $sce.trustAsResourceUrl(URL.createObjectURL(blob));
    
            // Use the reusable function
            $scope.playDingThenCallback(function() {
                var announcementAudio = document.getElementById('announcementAudio');
                if (announcementAudio) {
                    announcementAudio.src = $scope.audioSrc;
                    announcementAudio.play();
                } else {
                    console.error('Announcement audio element not found');
                }
            });
        })
            .catch(function(error) {
                // Handle errors here, such as displaying a message to the user
                console.error('Error fetching announcement:', error);
                $scope.announcementApiReport = error;
            })
            .finally(function() {
                $scope.isAnnouncementLoading = false; // Hide spinner
            });
    };

    $scope.startPreBoardingAnnouncement = function() {

        var noiseAudio = document.getElementById('noiseAudio');
        noiseAudio.loop = true; // Set the audio to loop
        noiseAudio.play(); // Start playing the audio
        
        $scope.fetchAnnouncement('pre boarding');

        $timeout(function() {
            noiseAudio.loop = false; // stop the audio to loop
            noiseAudio.pause();
            noiseAudio.currentTime = 0; // Reset the audio to the start
        }, 60000); // 1min
    }

    $scope.startBoardingAnnouncements = function() {

        var noiseAudio = document.getElementById('noiseAudio');
        noiseAudio.loop = true; // Set the audio to loop
        noiseAudio.play(); // Start playing the audio

        $scope.fetchAnnouncement('boarding1');

        $timeout(function() {
            $scope.fetchAnnouncement('boarding2');
        }, 120000); // 2 minutes

        $timeout(function() {
            $scope.fetchAnnouncement('boarding3');
        }, 300000); // 5 minutes (2 + 3)

        $timeout(function() {
            $scope.fetchAnnouncement('boarding4');
        }, 480000); // 8 minutes (2 + 3 + 3)

        $timeout(function() {
            $scope.fetchAnnouncement('boarding5');
        }, 600000); // 10 minutes (2 + 3 + 3 + 2)

        $timeout(function() {
            $scope.fetchAnnouncement('boarding6');
            noiseAudio.currentTime = 0; // Reset the audio to the start
        }, 720000); // 12 minutes (2 + 3 + 3 + 2 + 2)

        $timeout(function() {
            noiseAudio.loop = false; // stop the audio to loop
            noiseAudio.pause();
            noiseAudio.currentTime = 0; // Reset the audio to the start
        }, 750000); // 12.5 minutes (2 + 3 + 3 + 2 + 2)
    };

    //Charts Tabs
    $scope.selectedTab = 'star'; // default selected tab

    $scope.selectTab = function(tab) {
        $scope.selectedTab = tab;
    };
    
}]);

app.filter('toLocalTime', function() {
    return function(input) {
        if (!input) {
            return '--';
        }
        var date = new Date(input);
        if (isNaN(date.getTime())) {
            return '--';
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // returns "hh:mm AM/PM" format
    };
});