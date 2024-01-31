// Define a new module named 'sharedModule'
angular.module('sharedModule', [])
.service('SharedService', ['$window', function($window) {
    return {
        getCallsign: function() {
            return $window.localStorage.getItem('callsign') || '';
        },
        setCallsign: function(value) {
            $window.localStorage.setItem('callsign', value);
        }
    };
}]);