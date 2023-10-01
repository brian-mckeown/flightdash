document.getElementById('customChecklistToggle').addEventListener('change', function() {
    var uploader = document.getElementById('customChecklistUploader');
    if (this.checked) {
        uploader.style.display = 'block';
    } else {
        uploader.style.display = 'none';
    }
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

    document.addEventListener('DOMContentLoaded', function() {
        const weatherSection = document.getElementById('weatherSection');
        const frequenciesSection = document.getElementById('frequenciesSection');
        
        const weatherCaret = document.getElementById('weatherCaret');
        const frequenciesCaret = document.getElementById('frequenciesCaret');
    
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
    });