/**************************** */
/*** ANGULAR JS SECTION BELOW */
/**************************** */
var app = angular.module('checklistApp', []);

app.controller('ChecklistController', ['$scope', '$sce', '$timeout', '$http', '$document', function($scope, $sce, $timeout, $http, $document) {
    
    $scope.versionNumber = '1.0.0 Alpha'; 
    $scope.state = 'Idle';
    $scope.messages = [];

    $scope.walkaroundStarted = false;
    $scope.prePowerChecklistStarted = false;

    $scope.icao = '';
    $scope.simbriefPilotId = '';
    $scope.flightPlanData = '';
    $scope.flightPlanTrustedHtml = '';
    $scope.airportData = {};
    $scope.airportInfo = {};
    
    $scope.runways = '';
    $scope.frequencies = '';

    $scope.metarSource='beta_aviationweather_gov';

    $scope.airportRequested = false;

    $scope.windSpeed = 0;
    $scope.windDirection = 0;

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
    
    $scope.buttonMessages = {
        'Walkaround': {
            'A': { text: 'Begin', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-1': {
            //Nose tires
            'A': { text: 'Look good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-2': {
            //Nose Struts
            'A': { text: 'Look good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-3': {
            //Nose Pitot Tubes
            'A': { text: 'Are fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-4': {
            //Nose Static Ports
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-5': {
            //tires
            'A': { text: 'Look Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-6': {
            //Left Tires
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-7': {
            //Left Struts
            'A': { text: 'Look fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-8': {
            //Left Brake Wear Indicators
            'A': { text: 'Are good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-9': {
            //Left wing leading and trailing edges
            'A': { text: 'Are fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-10': {
            //Left wing flaps
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-11': {
            //Left wing slats
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-12': {
            //Left wing fuel and vent ports. 
            'A': { text: 'Are good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-13': {
            //Left engine fan blades
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-14': {
            //Left engine intakes
            'A': { text: 'Fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-15': {
            //Left engine exhaust
            'A': { text: 'Is fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-16': {
            //Tail Horizontal Stabilizers
            'A': { text: 'Look good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-17': {
            //Tail Vertical Stabilizers
            'A': { text: 'Looks fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-18': {
            //APU Exhaust
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-19': {
            //Right Engine Fan Blades
            'A': { text: 'Are fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-20': {
            //Right Engine Intakes
            'A': { text: 'Looks good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-21': {
            //Right Engine Exhaust
            'A': { text: 'Looks fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-22': {
            //Right Wing Leading and Trailing Edges
            'A': { text: 'Look fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-23': {
            //Right Wing Flaps
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-24': {
            //Right Wing Slats
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-25': {
            //Right Wing Fuel and Vent Ports
            'A': { text: 'Look good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-26': {
            //Right Tires
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-27': {
            //Right Struts
            'A': { text: 'Look fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-28': {
            //Right Brake Wear Indicators
            'A': { text: 'Look fine.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-29': {
            //Windows
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-30': {
            //Doors
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Walkaround-31': {
            //Emergency Exits
            'A': { text: 'Good.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },
        'Pre-Power Checklist': {
            //Emergency Exits
            'A': { text: 'Begin.', color: 'success' },
            'D': { text: 'Cancel', color: 'danger' }
        },

        
        // More states can be added here with their own button messages
    };

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

    $scope.handleButtonPress = function(button) {
        if ($scope.state in $scope.buttonMessages && button in $scope.buttonMessages[$scope.state]) {
            var timestamp = new Date().toLocaleTimeString();
            var message = $scope.buttonMessages[$scope.state][button].text;
            var color = $scope.buttonMessages[$scope.state][button].color;
            $scope.speakText(message);
            $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: " + message), color: color });
        }
        $timeout(function() {
        if (button === 'A') {
            if ($scope.state === 'Walkaround') {
                $scope.state = 'Walkaround-1';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Nose Tires."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Nose Tires");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-1') {
                $scope.state = 'Walkaround-2';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Nose Struts"), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Nose Struts");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-2') {
                $scope.state = 'Walkaround-3';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Pitot Tubes"), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Pitot Tubes");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-3') {
                $scope.state = 'Walkaround-4';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Static Ports"), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Static Ports");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-4') {
                $scope.state = 'Walkaround-5';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left Tires"), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left Tires");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-5') {
                $scope.state = 'Walkaround-6';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left Struts."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left Struts");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-6') {
                $scope.state = 'Walkaround-7';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left Brake Wear Indicators."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left Brake Wear Indicators");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-7') {
                $scope.state = 'Walkaround-8';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left wing leading and trailing edges."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left wing leading and trailing edges");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-8') {
                $scope.state = 'Walkaround-9';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left flaps."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left flaps");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-9') {
                $scope.state = 'Walkaround-10';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left slats."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left slats");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-10') {
                $scope.state = 'Walkaround-11';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left fuel and vent ports."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left fuel and vent ports");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-11') {
                $scope.state = 'Walkaround-12';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left engine fan blades."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left engine fan blades");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-12') {
                $scope.state = 'Walkaround-13';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left engine intakes."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left engine intakes");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-13') {
                $scope.state = 'Walkaround-14';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Left engine exhaust."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Left engine exhaust");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-14') {
                $scope.state = 'Walkaround-15';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Tail horizontal stabilizers."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Tail horizontal stabilizers");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-15') {
                $scope.state = 'Walkaround-16';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Tail vertical stabilizer."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Tail vertical stabilizer");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-16') {
                $scope.state = 'Walkaround-17';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: APU Exhaust."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("A.P.U. Exhaust");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-17') {
                $scope.state = 'Walkaround-18';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right engine fan blades."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right engine fan blades");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-18') {
                $scope.state = 'Walkaround-19';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right engine intakes."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right engine intakes");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-19') {
                $scope.state = 'Walkaround-20';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right engine exhaust."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right Engine Exhaust");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-20') {
                $scope.state = 'Walkaround-21';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right wing leading and trailing edges."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right wing leading and trailing edges");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-21') {
                $scope.state = 'Walkaround-22';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right flaps."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right Flaps");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-22') {
                $scope.state = 'Walkaround-23';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right slats."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right slats");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-23') {
                $scope.state = 'Walkaround-24';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right wing fuel and vent ports."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right wing fuel and vent ports");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-24') {
                $scope.state = 'Walkaround-25';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Nose Tires."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Nose tires");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-25') {
                $scope.state = 'Walkaround-26';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right tires."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right Tires");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-26') {
                $scope.state = 'Walkaround-27';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right struts."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Right struts");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-27') {
                $scope.state = 'Walkaround-28';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Right brake wear indicators."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Righ brake wear indicators");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-28') {
                $scope.state = 'Walkaround-29';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Windows."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Windows");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-29') {
                $scope.state = 'Walkaround-30';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Doors."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Doors");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-30') {
                $scope.state = 'Walkaround-31';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Emergency Exits."), color: 'magenta' });
                $scope.messages.push({ text: $sce.trustAsHtml("A - Look good."), color: 'success' });
                $scope.messages.push({ text: $sce.trustAsHtml("D - Exit"), color: 'danger' });
                $scope.speakText("Emergency Exits");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Walkaround-31') {
                $scope.state = 'Idle';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Walkaround Complete."), color: 'magenta' });
                $scope.speakText("Walkaround complete");

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            else if ($scope.state === 'Pre-Power Checklist') {
                $scope.state = 'Idle';
                var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
                $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Walkaround Complete."), color: 'magenta' });

                $scope.scrollToBottom(); // Scroll to the bottom after sending a message
            }
            
        }
        if (button === 'B') {
            if ($scope.state === 'Walkaround') {
                //$scope.walkaroundStarted = false;
            }
        }
        if (button === 'C') {
            if ($scope.state === 'Walkaround') {
                //$scope.walkaroundStarted = false;
            }
        }
        if (button === 'D') {
            if ($scope.state === 'Walkaround') {
                //$scope.walkaroundStarted = false;
            }
            $scope.state = 'Idle';
        }
        if (button === 'Reset') {
            $scope.state = 'Idle';
            $scope.walkaroundStarted = false;
            $scope.prePowerChecklistStarted = false;

        }
    
        // Additional actions for other buttons can be added as needed

        $scope.scrollToBottom(); // Scroll to the bottom after sending a message
    }, 1000);
    $scope.scrollToBottom()
    };

    $scope.startWalkaround = function() {

        $scope.walkaroundStarted = true;
        var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
        
        // Append messages
        $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Let's begin the walkaround"), color: 'magenta' });
        $scope.messages.push({ text: $sce.trustAsHtml("A - Begin"), color: 'success' });
        $scope.messages.push({ text: $sce.trustAsHtml("D - Cancel"), color: 'danger' });
        $scope.speakText("Let's begin the walkaround");

        $scope.scrollToBottom(); // Scroll to the bottom after sending a message
    };

    $scope.startPrePowerChecklist = function() {

        $scope.prePowerChecklistStarted = true;
        var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
        
        // Append messages
        $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Let's check the cockpit before powering up."), color: 'magenta' });
        $scope.messages.push({ text: $sce.trustAsHtml("A - Begin"), color: 'success' });
        $scope.messages.push({ text: $sce.trustAsHtml("D - Cancel"), color: 'danger' });
        $scope.speakText("Let's check the cockpit before powering up");

        $scope.scrollToBottom(); // Scroll to the bottom after sending a message
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
    
        if (parts[index].match(/\d{2}\/\d{2}/)) {
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
    

    /*** API CALLS */
    $scope.fetchFlightPlan = function() {
        $http.get('/api/v1/flightplan/' + $scope.simbriefPilotId)
            .then(function(response) {
                // Handle the returned data here
                $scope.flightPlanData = response.data;
                console.log($scope.flightPlanData);
                if ($scope.flightPlanData && $scope.flightPlanData.text) {
                    $scope.flightPlanTrustedHtml = $sce.trustAsHtml($scope.flightPlanData.text.plan_html);
                }
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
    
}]);