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