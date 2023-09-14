/**************************** */
/*** ANGULAR JS SECTION BELOW */
/**************************** */
var app = angular.module('checklistApp', []);

app.controller('ChecklistController', ['$scope', '$sce', '$timeout', '$http', function($scope, $sce, $timeout, $http) {
    $scope.state = 'Idle';
    $scope.messages = [];

    $scope.walkaroundStarted = false;
    $scope.prePowerChecklistStarted = false;

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
        $scope.speakText("Let's begin the walkaround");

        $scope.scrollToBottom(); // Scroll to the bottom after sending a message
    };
}]);