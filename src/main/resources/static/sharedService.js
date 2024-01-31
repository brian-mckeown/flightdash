// Define a new module named 'sharedModule'
angular.module('sharedModule', [])
.service('SharedService', ['$window', function($window) {

    var vatTrackBannerPilotKey = 'vatTrackBannerPilot';

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
        }
    };
}]);