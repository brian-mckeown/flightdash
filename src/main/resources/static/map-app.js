angular.module('flightMapApp', ['sharedModule'])
    .controller('MapController', ['$http', '$scope', 'SharedService', function ($http, $scope, SharedService ) {
        
        // Initialize $scope.callSign from SharedService
        $scope.callSign = SharedService.getCallsign();

        // Optionally, if you need to react to changes in callSign value from localStorage:
        window.addEventListener('storage', function(event) {
            if (event.key === 'callsign') {
                $scope.$apply(function() {
                    $scope.callSign = event.newValue;
                });
            }
        });
        
        var vm = this;
        var airportData = airportBigData;
        vm.isWeatherLayerActive = true; // Track the state of the weather layer
        // Initialize the map
        var map = L.map('map').setView([40.730610, -73.935242], 3);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>, <a href="https://carto.com/attribution/" target="_blank">© CARTO</a>, <a href="https://github.com/brian-mckeown/flightdash" target="_blank"><i class="fa-brands fa-github"></i> FlightDash.io</a>',
            maxZoom: 19
        }).addTo(map);


        //SEARCH
        vm.searchQuery = '';
        vm.searchResults = [];

        vm.searchCallsign = function() {
            vm.searchResults = [];
            if (vm.searchQuery.length > 0) {
                for (var callsign in markers) {
                    if (markers.hasOwnProperty(callsign) && callsign.toLowerCase().includes(vm.searchQuery.toLowerCase())) {
                        vm.searchResults.push({callsign: callsign, marker: markers[callsign]});
                    }
                }
            }
        };

        vm.selectFlight = function(flight) {
            map.setView(flight.marker.getLatLng(), 12); // Zoom to level per preference
            flight.marker.openPopup(); // Open the popup of the marker
            vm.searchQuery = ''; // Clear search query
            vm.searchResults = []; // Clear search results
        };

        //STREAMER FUCNTIONALITY
        // Inside your controller
        vm.showStreamersOverlay = false;
        vm.showStreamerDropdown = false;

        vm.toggleStreamerDropdown = function() {
            vm.showStreamerDropdown = !vm.showStreamerDropdown;
        };

        vm.selectFlightByCallsign = function(callsign) {
            let marker = markers[callsign];
        
            if (!marker) {
                let icaoCode = getIcaoCodeFromCallsign(callsign);
                marker = controllerMarkers[icaoCode];
            }
        
            if (marker) {
                map.setView(marker.getLatLng(), 12); // Adjust zoom level as needed
                marker.openPopup(); // Optional, if you want to open the popup
            } else {
                console.log("Marker not found for callsign: " + callsign);
            }
        };
        
        function getIcaoCodeFromCallsign(callsign) {
            let code = callsign.split('_')[0];
            return code.length === 3 ? 'K' + code : code; // Adjust this based on your data format
        }

        //WEATHER LAYER
        var currentRadarLayer = null;

        vm.initializeRadarLayer = async function () {
            if (vm.isWeatherLayerActive) {
            try {
                if (currentRadarLayer) {
                    map.removeLayer(currentRadarLayer); // Remove the old radar layer
                }

                var response = await $http.get('https://tilecache.rainviewer.com/api/maps.json');
                var data = response.data;
                var ts = data[data.length - 1]; // Get the latest timestamp
                currentRadarLayer = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/' + ts + '/512/{z}/{x}/{y}/6/0_1.png', {
                    tileSize: 256,
                    opacity: 0.5,
                });
                currentRadarLayer.addTo(map);
            } catch (error) {
                console.error('Error fetching radar data:', error);
            }
        }
        };
        // Refresh interval for radar data (1 minute)
        var radarRefreshInterval = 60000;

        // Set up the interval
        setInterval(function () {
            vm.initializeRadarLayer(); // Refresh radar data
        }, radarRefreshInterval);

        // Load initial radar data
        vm.initializeRadarLayer();

        // Function to toggle the radar layer
        vm.toggleWeatherLayer = function () {
            if (map.hasLayer(currentRadarLayer)) {
                map.removeLayer(currentRadarLayer);
                vm.isWeatherLayerActive = false;
            } else {
                vm.isWeatherLayerActive = true;
                vm.initializeRadarLayer();
            }
        };

        // Function to toggle the streamer overlay
        vm.toggleStreamerOverlay = function () {
            if (vm.showStreamersOverlay) {
                vm.showStreamersOverlay = false;
            } else {
                vm.showStreamersOverlay = true;
            }
        };

        // Initiate Objects to keep track of markers
        var markers = {};
        var controllerMarkers = {};

        vm.clearControllerMarkers = function () {
            for (var key in controllerMarkers) {
                if (controllerMarkers.hasOwnProperty(key)) {
                    map.removeLayer(controllerMarkers[key]);
                }
            }
            controllerMarkers = {}; // Reset the controller markers object
        };

        //Reset Markers Function
        vm.resetAllMarkers = function () {
            // Loop through and remove all flight markers
            for (var callsign in markers) {
                if (markers.hasOwnProperty(callsign)) {
                    // Clear interval if it exists
                    if (markers[callsign].animationInterval) {
                        clearInterval(markers[callsign].animationInterval);
                    }
                    map.removeLayer(markers[callsign]);
                }
            }
            markers = {}; // Reset the flight markers object

            // Loop through and remove all controller markers
            for (var locationKey in controllerMarkers) {
                if (controllerMarkers.hasOwnProperty(locationKey)) {
                    map.removeLayer(controllerMarkers[locationKey]);
                }
            }
            controllerMarkers = {}; // Reset the controller markers object

            // Fetch VATSIM data again
            vm.loadVatsimData();
        };

        var vatsimDataInterval;
        vm.loadVatsimData = function () {
            // Clear existing interval
            clearInterval(vatsimDataInterval);

            $http.get('https://data.vatsim.net/v3/vatsim-data.json').then(function (response) {
                // Extract new callsigns from the data
                var newCallsigns = new Set([
                    ...response.data.pilots.map(pilot => pilot.callsign),
                    ...response.data.controllers.map(controller => controller.callsign)
                ]);

                // Find a pilot with a matching primary callsign
                var matchingPilot = response.data.pilots.find(pilot => pilot.callsign === $scope.callSign);
                if (matchingPilot) {
                    // Calculate toGoDistance
                    var arrivalIcao = matchingPilot.flight_plan ? matchingPilot.flight_plan.arrival : null;
                    var departureIcao = matchingPilot.flight_plan ? matchingPilot.flight_plan.departure : null;
                    var toGoDistance = 0;
                    if (arrivalIcao && airportData[arrivalIcao]) {
                        var arrivalAirport = airportData[arrivalIcao];
                        toGoDistance = calculateDistance(matchingPilot.latitude, matchingPilot.longitude, arrivalAirport.lat, arrivalAirport.lon);
                    }

                    // Set status and toGoDistance
                    matchingPilot.status = vm.getVatsimFlightStatus(matchingPilot.flight_plan, matchingPilot.groundspeed, toGoDistance);
                    matchingPilot.toGoDistance = toGoDistance;

                    // Update vatTrackBannerPilot in scope and shared service
                    $scope.vatTrackBannerPilot = matchingPilot;
                    SharedService.setVatTrackBannerPilot(matchingPilot); // Set object in shared service
                
                    // Find pilots with the same departure and arrival and set status and toGoDistance for each
                    var similarFlightPlanPilots = response.data.pilots.filter(pilot => 
                        pilot.flight_plan &&
                        pilot.flight_plan.departure === departureIcao &&
                        pilot.flight_plan.arrival === arrivalIcao
                    ).map(pilot => {
                        var pilotToGoDistance = calculateDistance(pilot.latitude, pilot.longitude, arrivalAirport.lat, arrivalAirport.lon);
                        return {
                            ...pilot,
                            status: vm.getVatsimFlightStatus(pilot.flight_plan, pilot.groundspeed, pilotToGoDistance),
                            toGoDistance: pilotToGoDistance
                        };
                    });

                    // Set the array of similar flight plan pilots in the shared service
                    SharedService.setSimilarFlightPlanPilots(similarFlightPlanPilots);
                }

                // Clear streamers list
                vm.streamers = [];

                // Function to check and add streamers
                function addStreamerIfPresent(entity) {
                    var remarks = entity.flight_plan?.remarks || entity.text_atis?.join(' ') || '';
                    if (/youtube/i.test(remarks)) {
                        vm.streamers.push({ callsign: entity.callsign, platform: 'youtube' });
                    } else if (/twitch/i.test(remarks)) {
                        vm.streamers.push({ callsign: entity.callsign, platform: 'twitch' });
                    }
                }

                // Check each pilot and controller for streaming keywords
                response.data.pilots.forEach(addStreamerIfPresent);
                response.data.controllers.forEach(addStreamerIfPresent);

                // Randomize streamers list
                vm.streamers.sort(() => 0.5 - Math.random());
                console.log(vm.streamers);

                // Remove markers not present in the new data
                Object.keys(markers).forEach(function (callsign) {
                    if (!newCallsigns.has(callsign)) {
                        map.removeLayer(markers[callsign]);
                        delete markers[callsign];
                    }
                });

                // Add new markers for flights and controllers
                vm.displayFlights(response.data);
                // Clear all controller markers then display new
                vm.clearControllerMarkers();
                vm.displayControllers(response.data);

            }, function (error) {
                console.error('Error fetching VATSIM data:', error);
            });
            // Set up the interval
            vatsimDataInterval = setInterval(function () {
                vm.loadVatsimData();
            }, refreshInterval);
        };

        // Interval time in milliseconds (20 seconds)
        var refreshInterval = 20000;

        // Set up the interval
        setInterval(function () {
            vm.loadVatsimData();
        }, refreshInterval);


        function getRotatedAirplaneSvg(rotationAngle) {
            return `<div style="transform: rotate(${rotationAngle}deg);">${airplaneSvg}</div>`;
        }


        var airplaneSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-7.8 6.4-12.8 6.4l-42 0c-7.8 0-14-6.3-14-14c0-1.3 .2-2.6 .5-3.9L32 256 .5 145.9c-.4-1.3-.5-2.6-.5-3.9c0-7.8 6.3-14 14-14l42 0c5 0 9.8 2.4 12.8 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z" fill="#FF6700"/></svg>';
        var airplaneIconUrl = 'data:image/svg+xml;base64,' + btoa(airplaneSvg);
        var airplaneIcon = L.icon({
            iconUrl: airplaneIconUrl,
            iconSize: [19, 19], // Adjust the size as needed
            iconAnchor: [9.5, 9.5],
            popupAnchor: [0, -19]
        });

        function convertUrlsToLinks(text) {
            var urlRegex = /(https?:\/\/[^\s]+)|(twitch\.tv\/\S+)|(youtube\.com\/\S+)/gi;
            return text.replace(urlRegex, function(url) {
                // Check if the URL starts with http/https, if not, prepend 'http://'
                if (!url.match(/^https?:\/\//)) {
                    url = 'http://' + url;
                }
                return '<a href="' + url + '" target="_blank">' + url + '</a>';
            });
        }

        vm.displayFlights = function (data) {
            data.pilots.forEach(function (pilot) {
                var currentPosition = [pilot.latitude, pilot.longitude];
                var rotationAngle = pilot.heading - 90; // Subtract 90 as the default position is at a heading of 90

                // Get arrival ICAO code
                var arrivalIcao = pilot.flight_plan ? pilot.flight_plan.arrival : null;
                var toGoDistance = 0;
                if (arrivalIcao && airportData[arrivalIcao]) {
                    var arrivalAirport = airportData[arrivalIcao];
                    toGoDistance = calculateDistance(pilot.latitude, pilot.longitude, arrivalAirport.lat, arrivalAirport.lon);
        }

                var departureAirport = pilot.flight_plan && airportData[pilot.flight_plan.departure];
                var arrivalAirport = pilot.flight_plan && airportData[pilot.flight_plan.arrival];

                var departureInfo = departureAirport 
                    ? `${departureAirport.name}, ${departureAirport.city}, ${departureAirport.state}, ${departureAirport.country}` 
                    : 'N/A';
                var arrivalInfo = arrivalAirport 
                    ? `${arrivalAirport.name}, ${arrivalAirport.city}, ${arrivalAirport.state}, ${arrivalAirport.country}` 
                    : 'N/A';

                // Calculate distances
                var totalDistance = 0, progressPercentage = 0;
                if (departureAirport && arrivalAirport) {
                    totalDistance = calculateDistance(departureAirport.lat, departureAirport.lon, arrivalAirport.lat, arrivalAirport.lon);
                    progressPercentage = Math.max(0, Math.min(100, ((totalDistance - toGoDistance) / totalDistance * 100)));
                }

                var flightStatus = vm.getVatsimFlightStatus(pilot.flight_plan, pilot.groundspeed, toGoDistance);
                var remarksWithLinks = pilot.flight_plan && pilot.flight_plan.remarks ? convertUrlsToLinks(pilot.flight_plan.remarks) : 'None';
                var popupContent = `
                    <div class="d-flex justify-content-between align-items-center">
                        <h4><i class="fa-solid fa-plane"></i>${pilot.callsign}</h4>
                        <h6 class="rounded px-2 ${flightStatus.class}">${flightStatus.status}</h6>
                    </div>
                    <h4 class="small text-secondary">${pilot.flight_plan && pilot.flight_plan.aircraft_short ? pilot.flight_plan.aircraft_short : 'N/A'} - ${pilot.name}</h4>
                    <div class="row mb-2 progress-bar-row">
                        <div class="col">
                            <h5><strong>${pilot.flight_plan && pilot.flight_plan.departure ? pilot.flight_plan.departure : 'N/A'}</strong></h5>
                        </div>
                        <div class="col">
                        <div class="progress" style="position: relative; height: 20px; overflow: visible;">
                            <div class="progress-bar bg-info" role="progressbar" style="width: ${progressPercentage}%;"
                                aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                            <i class="fa-solid fa-plane" style="position: absolute; left: calc(${progressPercentage}% - 6px); top: 50%; transform: translateY(-50%) scale(1.5);"></i>
                            <!-- Adjusted left calc and transform for better icon positioning and scaling -->
                        </div>
                        </div>
                        <div class="col">
                            <h5><strong>${pilot.flight_plan && pilot.flight_plan.arrival ? pilot.flight_plan.arrival : 'N/A'}</strong></h5>
                        </div>
                    </div>
                    <div class="row airport-detail-row">
                        <div class="col">
                            <p class="small">${departureInfo}</p>
                        </div>
                        <div class="col">
                            <p class="small">${arrivalInfo}</p>
                        </div>
                    </div>
                    <div class="row bg-dark text-white rounded">
                        <div class="col">
                            Speed:<h6>${pilot.groundspeed} kts</h6>
                        </div>
                        <div class="col">
                            Altitude:<h6>${pilot.altitude} ft</h6>
                        </div>
                        <div class="col">
                            To Go:<h6>${toGoDistance.toFixed(0)} nm</h6><!-- Show rounded distance -->
                        </div>
                    </div>
                    <br>
                    <div>
                        <strong>Route:</strong> ${pilot.flight_plan && pilot.flight_plan.route ? pilot.flight_plan.route : 'N/A'}<br>
                        <strong>Server:</strong> ${pilot.server}<br>
                        <strong>Pilot Rating:</strong> ${pilot.pilot_rating}<br>
                        <strong>Latitude:</strong> ${pilot.latitude}<br>
                        <strong>Longitude:</strong> ${pilot.longitude}<br>
                        <strong>Transponder:</strong> ${pilot.transponder}<br>
                        <strong>Assigned Transponder:</strong> ${pilot.flight_plan && pilot.flight_plan.assigned_transponder ? pilot.flight_plan.assigned_transponder : 'N/A'}<br>
                        <strong>Heading:</strong> ${pilot.heading}<br>
                        <strong>Remarks:</strong> ${remarksWithLinks}
                    </div>`;


                var rotatedIconHtml = getRotatedAirplaneSvg(rotationAngle);
                var rotatedIcon = L.divIcon({
                    html: rotatedIconHtml,
                    iconSize: L.point(19, 19),
                    className: ''
                });

                // Update or create marker
                if (markers[pilot.callsign]) {
                    clearInterval(markers[pilot.callsign].animationInterval);
                    markers[pilot.callsign].setLatLng(currentPosition).setIcon(rotatedIcon).setPopupContent(popupContent);
                    markers[pilot.callsign].pilotData = pilot; // Update pilot data
                    markers[pilot.callsign].animationCounter = 0; // Reset animation counter
                } else {
                    markers[pilot.callsign] = L.marker(currentPosition, { icon: rotatedIcon }).bindPopup(popupContent).addTo(map);
                    markers[pilot.callsign].pilotData = pilot; // Store pilot data
                    markers[pilot.callsign].animationCounter = 0; // Initialize animation counter
                }

                // Set up a new animation interval
                markers[pilot.callsign].animationInterval = setInterval(function () {
                    // Check if the marker still exists
                    if (!markers[pilot.callsign]) {
                        clearInterval(markers[pilot.callsign]?.animationInterval);
                        return;
                    }

                    if (markers[pilot.callsign].animationCounter >= 5) {
                        clearInterval(markers[pilot.callsign].animationInterval);
                        return;
                    }

                    var pilotData = markers[pilot.callsign].pilotData;
                    var newPosition = calculateNewPosition(
                        markers[pilot.callsign].getLatLng().lat,
                        markers[pilot.callsign].getLatLng().lng,
                        pilotData.heading,
                        pilotData.groundspeed
                    );

                    markers[pilot.callsign].setLatLng(newPosition);
                    markers[pilot.callsign].animationCounter++;
                }, 3000);
            });
        };

        vm.getVatsimFlightStatus = function(flight_plan ,speed, toGoDistance) {
            if (speed === 0 && toGoDistance > 20 && flight_plan !== null) return { status: "Pre-Departure", class: "bg-secondary text-white" };
            if (speed > 0 && speed < 50 && toGoDistance > 20 && flight_plan !== null) return { status: "Left Gate", class: "bg-info text-white" };
            if (speed >= 50 && toGoDistance > 20 && flight_plan !== null) return { status: "Enroute", class: "bg-primary text-white" };
            if (speed >= 50 && toGoDistance < 20 && flight_plan !== null) return { status: "Arriving Shortly", class: "bg-warning text-white" };
            if (speed < 50 && speed > 0 && toGoDistance < 20 && flight_plan !== null) return { status: "Landed", class: "bg-success text-white" };
            if (speed === 0 && toGoDistance < 20 && flight_plan !== null) return { status: "Arrived", class: "bg-success text-white" };
            if (flight_plan === null) return { status: "Not Filed", class: "bg-dark text-white" };
            return { status: "Unknown", class: "bg-dark text-white" }; // Default case
        };

        vm.clearUnusedMarkers = function (data) {
            for (var callsign in markers) {
                if (markers.hasOwnProperty(callsign)) {
                    var found = data.pilots.some(pilot => pilot.callsign === callsign);
                    if (!found) {
                        map.removeLayer(markers[callsign]);
                        delete markers[callsign];
                    }
                }
            }
        };

        //Controllers ********
        function getIcaoCodeFromCallsign(callsign) {
            return callsign.split('_')[0];
        }

        function createControllerIcon(controllerInfo, icaoCode) {
            var labelsHtml = '';

            // Define label styles for different controller types
            var controllerTypes = {
                'ATIS': { label: 'A', class: 'badge bg-warning text-white' },
                'GND': { label: 'G', class: 'badge bg-success text-white' },
                'DEL': { label: 'D', class: 'badge bg-primary text-white' },
                'TWR': { label: 'T', class: 'badge bg-danger text-white' },
                'APP': { label: 'App', class: 'badge bg-info text-white' },
                'CTR': { label: 'Ctr', class: 'badge bg-secondary text-white' }
            };

            // Check for each controller type in the callsign and add corresponding label
            for (var type in controllerTypes) {
                if (controllerInfo.includes(type)) {
                    var labelInfo = controllerTypes[type];
                    labelsHtml += `<span class="${labelInfo.class}">${labelInfo.label}</span> `;
                }
            }

            var controllerSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 48C141.1 48 48 141.1 48 256v40c0 13.3-10.7 24-24 24s-24-10.7-24-24V256C0 114.6 114.6 0 256 0S512 114.6 512 256V400.1c0 48.6-39.4 88-88.1 88L313.6 488c-8.3 14.3-23.8 24-41.6 24H240c-26.5 0-48-21.5-48-48s21.5-48 48-48h32c17.8 0 33.3 9.7 41.6 24l110.4 .1c22.1 0 40-17.9 40-40V256c0-114.9-93.1-208-208-208zM144 208h16c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H144c-35.3 0-64-28.7-64-64V272c0-35.3 28.7-64 64-64zm224 0c35.3 0 64 28.7 64 64v48c0 35.3-28.7 64-64 64H352c-17.7 0-32-14.3-32-32V240c0-17.7 14.3-32 32-32h16z" fill="#39FF14"/></svg>'; // Neon green fill
            return L.divIcon({
                html: `<div class="bg-dark" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="color: #39FF14;">${controllerSvg}${icaoCode}</div>
            <div style='display: flex; justify-content: center; align-items: center; min-width: 100px;'>${labelsHtml}</div>
           </div>`,
                iconSize: L.point(32, 32),
                className: ''
            });
        }

        vm.displayControllers = function (data) {
            var controllersByLocation = {};
        
            var processControllerData = function (controller) {
                var icaoCode = getIcaoCodeFromCallsign(controller.callsign);
                var coords = getCoordinatesForIcao(icaoCode);
        
                if (coords) {
                    var locationKey = coords.lat + ',' + coords.lng;
        
                    if (!controllersByLocation[locationKey]) {
                        var airportInfo = airportData[icaoCode];
                        var airportDetails = airportInfo ? `<strong>${airportInfo.name}, ${airportInfo.city}, ${airportInfo.state}, ${airportInfo.country}</strong><br><br>` : "<strong></strong><br><br>";
        
                        controllersByLocation[locationKey] = {
                            coords: coords,
                            controllers: [],
                            icaoCode: icaoCode,
                            airportDetails: airportDetails
                        };
                    }
        
                    var loginTime = new Date(controller.logon_time);
                    var now = new Date();
                    var minutesSinceLogin = Math.round((now - loginTime) / 60000);
                    var atisTextWithLinks = controller.text_atis && controller.text_atis.length > 0 
                                            ? convertUrlsToLinks(controller.text_atis.join(' ')) 
                                            : '';
        
                    var controllerInfo = `<strong>${controller.callsign}</strong><br>${controller.name}<br><span class="badge bg-dark freq-badge">${controller.frequency}</span><br>Rating: ${controller.rating}`;
                    if (atisTextWithLinks) {
                        controllerInfo += `<br>${atisTextWithLinks}`;
                    }
                    controllerInfo += `<br>Logged in for: ${minutesSinceLogin} minutes`;
        
                    controllersByLocation[locationKey].controllers.push(controllerInfo);
                }
            };
        
            // Process controller and ATIS data
            data.controllers.forEach(processControllerData);
            data.atis.forEach(processControllerData);
        
            // Create markers for each location with aggregated controller info
            for (var key in controllersByLocation) {
                var locationData = controllersByLocation[key];
                var popupContent = locationData.airportDetails + locationData.controllers.join("<br><br>");
                var controllerIcon = createControllerIcon(locationData.controllers.join(" "), locationData.icaoCode);
        
                var marker = L.marker([locationData.coords.lat, locationData.coords.lng], {
                    icon: controllerIcon,
                    zIndexOffset: 1000
                }).bindPopup(popupContent).addTo(map);
        
                controllerMarkers[locationData.icaoCode] = marker;
            }
        };
        


        function getCoordinatesForIcao(callsign) {
            // Extract the code from the callsign
            var code = callsign.split('_')[0];

            // Check for ICAO code first (for US airports, prepend 'K')
            var icaoCode = code.length === 3 ? 'K' + code : code;
            var airport = airportData[icaoCode];

            if (!airport) {
                // If not found, try IATA code
                // Find the airport where the IATA matches the code
                for (var key in airportData) {
                    if (airportData[key].iata === code) {
                        airport = airportData[key];
                        break;
                    }
                }
            }

            if (airport) {
                return { lat: airport.lat, lng: airport.lon };
            } else {
                return null;
            }
        }

        function calculateNewPosition(lat, lng, heading, speed) {
            // Convert speed from knots to km/h (1 knot = 1.852 km/h)
            var speedKmh = speed * 1.852;

            // Distance travelled in 3 seconds (in km)
            var distance = (speedKmh / 3600) * 3; // speed (km/h) * time (h)

            // Convert heading to radians
            var headingRad = heading * Math.PI / 180;

            // Convert latitude and longitude to radians
            var latRad = lat * Math.PI / 180;
            var lngRad = lng * Math.PI / 180;

            // Earth's radius in kilometers
            var earthRadiusKm = 6371;

            // New latitude in radians
            var newLatRad = Math.asin(Math.sin(latRad) * Math.cos(distance / earthRadiusKm) +
                Math.cos(latRad) * Math.sin(distance / earthRadiusKm) * Math.cos(headingRad));

            // New longitude in radians
            var newLngRad = lngRad + Math.atan2(Math.sin(headingRad) * Math.sin(distance / earthRadiusKm) * Math.cos(latRad),
                Math.cos(distance / earthRadiusKm) - Math.sin(latRad) * Math.sin(newLatRad));

            // Convert radians back to degrees
            var newLat = newLatRad * 180 / Math.PI;
            var newLng = newLngRad * 180 / Math.PI;

            return [newLat, newLng];
        }

        function calculateDistance(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the Earth in km
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var distance = R * c; // Distance in km
            return distance * 0.539957; // Convert km to nautical miles
        }

        // Load VATSIM data
        vm.loadVatsimData(); // Load initial data
    }]);

