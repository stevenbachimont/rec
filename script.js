
var sourceSelector = document.getElementById('source-selector');
var videoElement = document.getElementById('video');
var capturePhotoButton = document.getElementById('capture-photo-btn');
var startRecordButton = document.getElementById('start-record-btn');
var stopRecordButton = document.getElementById('stop-record-btn');
var canvasElement = document.getElementById('canvas');
var context = canvasElement.getContext('2d');
var mediaRecorder;
var recordedChunks = [];
var mediaStream;

async function startCapture() {
    var selectedSource = getSelectedSource();
    try {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        if (selectedSource === 'camera') {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } else if (selectedSource === 'screen') {
            mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        }
        videoElement.srcObject = mediaStream;
        mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        mediaRecorder.onstop = function() {
            var outputFormat = 'mp4';
            var blob = new Blob(recordedChunks, { type: 'video/' + outputFormat });
            var videoUrl = URL.createObjectURL(blob);

            var videoElement = document.getElementById('recorded-video');
            videoElement.src = videoUrl;

            var downloadLink = document.createElement('a');
            downloadLink.href = videoUrl;
            downloadLink.download = 'recorded-video.mp4';
            downloadLink.innerHTML = 'Télécharger la vidéo';
            downloadLink.className = 'download-link';
            var downloadContainer = document.getElementById('video-download-container');
            var existingDownloadLink = document.querySelector('#video-download-container .download-link');

            if (existingDownloadLink) {
                downloadContainer.replaceChild(downloadLink, existingDownloadLink);
            } else {
                downloadContainer.appendChild(downloadLink);
            }

            recordedChunks = [];
        };




    } catch (error) {
        console.error('Erreur lors de l\'accès à la webcam ou au partage d\'écran : ', error);
    }
}

sourceSelector.addEventListener('change', startCapture);

function getSelectedSource() {
    return sourceSelector.value;
}

function capturePhoto() {
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    var imageBase64 = canvasElement.toDataURL('image/jpeg');
    var imageElement = document.createElement('img');
    imageElement.src = imageBase64;
    document.body.appendChild(imageElement);
}

capturePhotoButton.addEventListener('click', capturePhoto);
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        capturePhoto();
    }
});

startRecordButton.addEventListener('click', function() {
    mediaRecorder.start();
    startRecordButton.style.display = 'none';
    stopRecordButton.style.display = 'block';
});

stopRecordButton.addEventListener('click', function() {
    mediaRecorder.stop();
    startRecordButton.style.display = 'block';
    stopRecordButton.style.display = 'none';
});

startCapture();
