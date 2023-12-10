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

document.addEventListener('DOMContentLoaded', function() {
    // Show the welcome modal
    var modal = new bootstrap.Modal(document.getElementById('welcomeModal'), {
      keyboard: false
    });
    modal.show();

    // Warning message and overlay logic
    let alertEl = document.getElementById('warning-message');
    let overlayEl = document.getElementById('overlay');

    // Show overlay when the alert is open and the screen width is less than 1200px
    if (window.innerWidth < 1200) {
        overlayEl.style.display = 'block';
    }

    // Add an event listener for the close button on the alert
    alertEl.addEventListener('closed.bs.alert', function () {
        overlayEl.style.display = 'none';
    });

    // Initialize popovers (ai costs)
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.forEach(function (popoverTriggerEl) {
        new bootstrap.Popover(popoverTriggerEl, {
            sanitize: false
        });
    });

    // Add global click event listener for closing popovers
    document.addEventListener('click', function (event) {
        // Check if the clicked element is the close button inside a popover
        if (event.target.matches('.close-popover')) {
            // Find all popovers
            var popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
            // Hide all popovers
            popovers.forEach(function(popover) {
                var bootstrapPopover = bootstrap.Popover.getInstance(popover);
                if (bootstrapPopover) {
                    bootstrapPopover.hide();
                }
            });
        }
    }, false);
});

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

fetch('/support')
    .then(response => response.text())
    .then(content => {
        document.getElementById('support').innerHTML = content;
    });

fetch('/about')
    .then(response => response.text())
    .then(content => {
        document.getElementById('about').innerHTML = content;
    });

fetch('/welcome')
    .then(response => response.text())
    .then(content => {
        document.getElementById('welcome').innerHTML = content;
    });

    document.addEventListener('DOMContentLoaded', function() {
        const weatherSection = document.getElementById('weatherSection');
        const frequenciesSection = document.getElementById('frequenciesSection');
        
        const weatherCaret = document.getElementById('weatherCaret');
        const frequenciesCaret = document.getElementById('frequenciesCaret');

        const runwaysSection = document.getElementById('runwaysSection');
        const runwaysCaret = document.getElementById('runwaysCaret');
    
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
    });