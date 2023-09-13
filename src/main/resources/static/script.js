/*document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('chat-message').addEventListener('keypress', function(event) {
    if (event.keyCode === 13 || event.which === 13) {  // Enter key
        event.preventDefault();  // Prevent default behavior like newline in textarea
        sendMessage();
    }
});

function sendMessage() {
    const messageArea = document.getElementById('chat-message');
    const chatContent = document.getElementById('chat-content');
    const message = messageArea.value.trim();

    if (message !== "") {
        const timestamp = new Date().toLocaleTimeString();
        chatContent.innerHTML += `<p><strong>[${timestamp}]</strong>: ${message}</p>`;
        messageArea.value = "";  // Clear the textarea
    }
    // Scroll to the bottom of the chatContent
    chatContent.scrollTop = chatContent.scrollHeight;
}*/

/**************************** */
/*** ANGULAR JS SECTION BELOW */
/**************************** */
var app = angular.module('checklistApp', []);

app.controller('ChecklistController', ['$scope', '$sce', function($scope, $sce) {
    $scope.state = 'Idle';
    $scope.messages = [];

    $scope.walkaroundStarted = false;

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
    };

    $scope.startWalkaround = function() {

        $scope.walkaroundStarted = true;
        var timestamp = new Date().toLocaleTimeString(); // e.g., "12:35:47 PM"
        
        // Append messages
        $scope.messages.push({ text: $sce.trustAsHtml("<strong>[" + timestamp + "]</strong>: Let's begin the walkaround"), color: 'magenta' });
        $scope.messages.push({ text: $sce.trustAsHtml("A - Begin"), color: 'success' });
        $scope.messages.push({ text: $sce.trustAsHtml("D - Cancel"), color: 'danger' });
    };
}]);