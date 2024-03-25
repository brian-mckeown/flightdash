var app = angular.module('announcementsApp', []);

app.directive('imgFallback', function () {
    return {
        restrict: 'A', // Ensures directive is used as an attribute
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                console.log(`Error loading image: ${attrs.src}, switching to fallback: ${attrs.imgFallback}`);
                if (attrs.src !== attrs.imgFallback) {
                    element.attr('src', attrs.imgFallback); // Use .attr() for jQuery or .prop for JQLite
                }
            });

            scope.$watch(function() { return attrs['ngSrc']; }, function(newValue) {
                if (!newValue && attrs.imgFallback) {
                    console.log(`ngSrc is empty, setting fallback image: ${attrs.imgFallback}`);
                    element.attr('src', attrs.imgFallback);
                }
            });
        }
    };
});

app.controller('announcementsController', ['$scope', '$sce', '$timeout', '$http', '$document', '$interval', function($scope, $sce, $timeout, $http, $document, $interval) {

    $scope.scheduledBoardingDateTime = '';
    $scope.scheduledDepartureDateTime = '';
    $scope.estimateArrivalDateTime = '';
    $scope.estimateGateArrivalDateTime = '';
    $scope.scheduledBoardingUtcTimeDisplay = '';
    $scope.scheduledDepartureUtcTimeDisplay = '';
    $scope.estimateArrivalUtcTimeDisplay = '';
    $scope.estimateGateArrivalUtcTimeDisplay = '';

    $scope.agreementCheckbox = false;
    $scope.keyValidated = false;
    $scope.flightDataComplete = false;

    $scope.simbriefPilotId = '';
    $scope.openAiApiKey = '';


    $scope.airline = '';
    $scope.callSign = '';

    var airlineUpdateTimeout;
    $scope.airlineManuallyEdited = false;

    $scope.$watch('callSign', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            if (airlineUpdateTimeout) $timeout.cancel(airlineUpdateTimeout);
            
            // Delay updating the airline flag to allow for manual edits
            airlineUpdateTimeout = $timeout(function() {
                $scope.airlineManuallyEdited = false;
                updateAirlineFromCallSign(newValue);
            }, 1000); // Adjust delay as needed
        }
    });

    $scope.$watch('airline', function(newValue, oldValue) {
        if (newValue !== oldValue && !$scope.airlineManuallyEdited) {
            $scope.airlineManuallyEdited = true;
            if (airlineUpdateTimeout) $timeout.cancel(airlineUpdateTimeout);
        }
    });

    function updateAirlineFromCallSign(callSign) {
        if (!$scope.airlineManuallyEdited) {
            const icaoCode = callSign.substring(0, 3).toUpperCase();
            const airline = window.airlinesBigData.find(airline => airline.icao === icaoCode);
            if (airline) {
                $scope.airline = airline.name;
            } else {
                console.log('Airline not found');
                $scope.airline = null;
            }
        }
    }

    $scope.getImageSrc = function(callSign) {
        return './assets/logos/' + (callSign ? callSign.substring(0, 3).toLowerCase() : 'default') + '.png';
    };


    $scope.convertToUTC = function(localDateTime, time) {
      if (!localDateTime) {
        return;
      }
      var localTime = new Date(localDateTime);

      switch(time) {
        case 'scheduled_boarding':
            $scope.scheduledBoardingUtcTimeDisplay = formatDateToUTC(localTime);
            break;
        case 'scheduled_departure':
            $scope.scheduledDepartureUtcTimeDisplay = formatDateToUTC(localTime);
            break;
        case 'estimate_arrival':
            $scope.estimateArrivalUtcTimeDisplay = formatDateToUTC(localTime);
            break;
        case 'estimate_gate_arrival':
            $scope.estimateGateArrivalUtcTimeDisplay = formatDateToUTC(localTime);
            break;
        default:
            console.log("Couldn't set UTC time");
    }
      
    };

    function formatDateToUTC(date) {
      return date.getUTCFullYear() + "/" +
             ("0" + (date.getUTCMonth() + 1)).slice(-2) + "/" +
             ("0" + date.getUTCDate()).slice(-2) + ", " +
             ("0" + date.getUTCHours()).slice(-2) + ":" +
             ("0" + date.getUTCMinutes()).slice(-2) + ":" +
             ("0" + date.getUTCSeconds()).slice(-2) + " Z";
    }

    $scope.$watch('agreementCheckbox', function(newValue, oldValue) {
        if (newValue === true) {
            // If agreementCheckbox is true, update classes
            document.getElementById('AgreementBar').className = 'alert alert-success small-alert';
            document.getElementById('KeysBar').className = 'alert alert-primary small-alert';

        // Programmatically collapse the Agreement section and expand the Keys section
        var agreementSection = new bootstrap.Collapse(document.getElementById('AgreementSection'), {
            toggle: false // Ensure not to toggle but explicitly set
        });
        var keysSection = new bootstrap.Collapse(document.getElementById('KeysSection'), {
            toggle: false // Ensure not to toggle but explicitly set
        });

        // Ensure agreement section is collapsed
        agreementSection.hide();
        // Ensure keys section is expanded
        keysSection.show();
    } else {
        // Reset to default classes when agreementCheckbox is not true
        document.getElementById('AgreementBar').className = 'alert alert-primary small-alert';
        document.getElementById('KeysBar').className = 'alert alert-secondary small-alert';
    }
    });

    $scope.toggleCollapse = function(event) {
        if (!$scope.agreementCheckbox) {
            event.preventDefault(); // Prevent toggling if checkbox is not checked
            return;
        }

        // Assuming you're using Bootstrap 5
        var collapseElementId = '#KeysSection';
        var collapseEl = document.querySelector(collapseElementId);
        var bsCollapse = new bootstrap.Collapse(collapseEl, {
            toggle: false // Do not toggle on initialization
        });

        // Check if the collapsible section is already shown
        if (collapseEl.classList.contains('show')) {
            bsCollapse.hide();
        } else {
            bsCollapse.show();
        }
    };

    $scope.saveKeys = function() {
        // Building the object conditionally
        var dataToSave = {};

        if($scope.simbriefPilotId) dataToSave.pilotId = $scope.simbriefPilotId;
        if($scope.openAiApiKey) dataToSave.openAiApiKey = $scope.openAiApiKey;
        
        // Convert the object to a string
        var jsonString = JSON.stringify(dataToSave, null, 4);
    
        // Create a blob of the data
        var blob = new Blob([jsonString], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        
        // Create a link element, use it to download the blob, and revoke the URL
        var a = document.createElement('a');
        a.download = 'announcements-ai-keys.json';
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
};

$scope.importKeys = function(inputElement) {
    var file = inputElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var contents = event.target.result;
            try {
                var jsonData = JSON.parse(contents);
                $scope.$apply(function() {
                    // Clear existing values
                    $scope.clearKeysValues();

                    // Set new values from JSON
                    $scope.simbriefPilotId = jsonData.pilotId;
                    $scope.openAiApiKey = jsonData.openAiApiKey;
                });
            } catch (e) {
                console.error("Failed to parse JSON.", e);
            }
        };
        reader.readAsText(file);
    }
};

$scope.clearKeysValues = function() {
    $scope.metarSource = '';
    $scope.simbriefPilotId = '';
    $scope.bundleName = '';
    $scope.tables = [];
};

  }]);
