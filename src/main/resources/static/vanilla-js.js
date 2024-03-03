//initialized bootstrap tooltips. 
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })

document.getElementById('customChecklistToggle').addEventListener('change', function() {
    var uploader = document.getElementById('customChecklistUploader');
    if (this.checked) {
        uploader.style.display = 'block';
    } else {
        uploader.style.display = 'none';
    }
});

window.onload = function() {
    var toastElList = [].slice.call(document.querySelectorAll('.toast'));
    var toastList = toastElList.map(function(toastEl) {
        return new bootstrap.Toast(toastEl);
    });
    toastList.forEach(toast => toast.show());
}

fetch('/privacy-policy')
    .then(response => response.text())
    .then(content => {
        document.getElementById('privacy-policy').innerHTML = content;
    });

fetch('/terms')
    .then(response => response.text())
    .then(content => {
        document.getElementById('terms').innerHTML = content;
    });

    document.addEventListener('DOMContentLoaded', function() {
        const weatherSection = document.getElementById('weatherSection');
        const frequenciesSection = document.getElementById('frequenciesSection');
        const vatsimSection = document.getElementById('vatsimSection');
        const webPlayerSection = document.getElementById('WebPlayerSection');
        const fenixGeneratorSection = document.getElementById('FenixGeneratorSection');
        
        const weatherCaret = document.getElementById('weatherCaret');
        const frequenciesCaret = document.getElementById('frequenciesCaret');

        const runwaysSection = document.getElementById('runwaysSection');
        const runwaysCaret = document.getElementById('runwaysCaret');
        const vatsimCaret = document.getElementById('vatsimCaret');

        const webPlayerCaret = document.getElementById('WebPlayerCaret');
        const fenixGeneratorCaret = document.getElementById('FenixGeneratorCaret');
    
        // Event listener for Weather section
        weatherSection.addEventListener('show.bs.collapse', function () {
            weatherCaret.classList.remove('fa-caret-right');
            weatherCaret.classList.add('fa-caret-down');
        });
    
        weatherSection.addEventListener('hide.bs.collapse', function () {
            weatherCaret.classList.remove('fa-caret-down');
            weatherCaret.classList.add('fa-caret-right');
        });
    
        // Event listener for Frequencies section
        frequenciesSection.addEventListener('show.bs.collapse', function () {
            frequenciesCaret.classList.remove('fa-caret-right');
            frequenciesCaret.classList.add('fa-caret-down');
        });
    
        frequenciesSection.addEventListener('hide.bs.collapse', function () {
            frequenciesCaret.classList.remove('fa-caret-down');
            frequenciesCaret.classList.add('fa-caret-right');
        });

        // Event listener for Runways section
        runwaysSection.addEventListener('show.bs.collapse', function () {
            runwaysCaret.classList.remove('fa-caret-right');
            runwaysCaret.classList.add('fa-caret-down');
        });

        runwaysSection.addEventListener('hide.bs.collapse', function () {
            runwaysCaret.classList.remove('fa-caret-down');
            runwaysCaret.classList.add('fa-caret-right');
        });

        // Event listener for Vatsim section
        vatsimSection.addEventListener('show.bs.collapse', function () {
            vatsimCaret.classList.remove('fa-caret-right');
            vatsimCaret.classList.add('fa-caret-down');
        });

        vatsimSection.addEventListener('hide.bs.collapse', function () {
            vatsimCaret.classList.remove('fa-caret-down');
            vatsimCaret.classList.add('fa-caret-right');
        });

        // Event listener for Web Player section
        webPlayerSection.addEventListener('show.bs.collapse', function () {
            webPlayerCaret.classList.remove('fa-caret-right');
            webPlayerCaret.classList.add('fa-caret-down');
        });

        webPlayerSection.addEventListener('hide.bs.collapse', function () {
            webPlayerCaret.classList.remove('fa-caret-down');
            webPlayerCaret.classList.add('fa-caret-right');
        });

        // Event listener for Fenix Generator section
        fenixGeneratorSection.addEventListener('show.bs.collapse', function () {
            fenixGeneratorCaret.classList.remove('fa-caret-right');
            fenixGeneratorCaret.classList.add('fa-caret-down');
        });

        fenixGeneratorSection.addEventListener('hide.bs.collapse', function () {
            fenixGeneratorCaret.classList.remove('fa-caret-down');
            fenixGeneratorCaret.classList.add('fa-caret-right');
        });

        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
            template: '<div class="tooltip" role="tooltip"><div class="arrow" style="color: #000;"></div><div class="tooltip-inner bg-light text-dark"></div></div>'
            });
        });
    });

    //announcement autopilot checkbox toggle
    function toggleAutopilotAnnouncementCheckboxes() {
        var checkBoxesDiv = document.getElementById("additionalAutopilotAnnouncementCheckboxes");
        var autopilotCheckbox = document.getElementById("autopilotCheckbox");
        checkBoxesDiv.style.display = autopilotCheckbox.checked ? "block" : "none";
    }