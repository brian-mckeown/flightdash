document.getElementById('customChecklistToggle').addEventListener('change', function() {
    var uploader = document.getElementById('customChecklistUploader');
    if (this.checked) {
        uploader.style.display = 'block';
    } else {
        uploader.style.display = 'none';
    }
});