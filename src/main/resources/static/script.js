/**************************** */
/*** ANGULAR JS SECTION BELOW */
/**************************** */
var app = angular.module('checklistApp', []);

app.controller('ChecklistController', ['$scope', '$sce', '$timeout', function($scope, $sce, $timeout) {
    $scope.state = 'Idle';
    $scope.messages = [];

    $scope.walkaroundStarted = false;

    $scope.buttonMessages = {
        'Walkaround': {
            'A': { text: 'A - Begin', color: 'success' },
            'D': { text: 'D - Cancel', color: 'danger' }
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

    $scope.handleButtonPress = function(button) {
        if ($scope.state in $scope.buttonMessages && button in $scope.buttonMessages[$scope.state]) {
            var timestamp = new Date().toLocaleTimeString();
            var message = $scope.buttonMessages[$scope.state][button].text;
            var color = $scope.buttonMessages[$scope.state][button].color;
            $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: " + message), color: color });
        }
    
        if (button === 'D') {
            if ($scope.state === 'Walkaround') {
                $scope.walkaroundStarted = false;
            }
            $scope.state = 'Idle';
        }
    
        // Additional actions for other buttons can be added as needed

        $scope.scrollToBottom(); // Scroll to the bottom after sending a message
    };

    $scope.startWalkaround = function() {

        $scope.walkaroundStarted = true;
        var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
        
        // Append messages
        $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Let's begin the walkaround"), color: 'magenta' });
        $scope.messages.push({ text: $sce.trustAsHtml("A - Begin"), color: 'success' });
        $scope.messages.push({ text: $sce.trustAsHtml("D - Cancel"), color: 'danger' });

        $scope.scrollToBottom(); // Scroll to the bottom after sending a message
    };
}]);