// Define a new module named 'sharedModule'
angular.module('sharedModule', [])
.service('SharedService', ['$window', function($window) {

    var vatTrackBannerPilotKey = 'vatTrackBannerPilot';
    var similarFlightPlanPilotsKey = 'similarFlightPlanPilots';
    var proximityPilotsKey = 'proximityPilots';

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
        },
        setProximityPilots: function(pilots) {
            $window.localStorage.setItem(proximityPilotsKey, JSON.stringify(pilots));
        },
        getProximityPilots: function() {
            return JSON.parse($window.localStorage.getItem(proximityPilotsKey)) || [];
        }
    };
}]);
