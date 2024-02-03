// Define a new module named 'sharedModule'
angular.module('sharedModule', [])
.service('SharedService', ['$window', function($window) {

    var vatTrackBannerPilotKey = 'vatTrackBannerPilot';
    var similarFlightPlanPilotsKey = 'similarFlightPlanPilots';

    return {
        getCallsign: function() {
            return $window.localStorage.getItem('callsign') || '';
        },
        setCallsign: function(value) {
            $window.localStorage.setItem('callsign', value);
        },
        getVatTrackBannerPilot: function() {
            return JSON.parse($window.localStorage.getItem(vatTrackBannerPilotKey)) || null;
        },
        setVatTrackBannerPilot: function(pilotData) {
            $window.localStorage.setItem(vatTrackBannerPilotKey, JSON.stringify(pilotData));
        },
        setSimilarFlightPlanPilots: function(pilots) {
            $window.localStorage.setItem(similarFlightPlanPilotsKey, JSON.stringify(pilots));
        },
        getSimilarFlightPlanPilots: function() {
            return JSON.parse($window.localStorage.getItem(similarFlightPlanPilotsKey)) || [];
        }
    };
}]);