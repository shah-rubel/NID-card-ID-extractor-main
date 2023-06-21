const imageUpload = document.getElementById('image-upload');
const fileName = document.getElementById('file-name');
const previewImage = document.getElementById('preview-image');
const nidNumber = document.getElementById('nid-number');
const submitButton = document.getElementById('submit-btn');
const captureButton = document.getElementById('capture-btn');
const video = document.getElementById('video');
let stream;
let isCapturing = false;

// Function to capture a photo from the webcam
function capturePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const photoURL = canvas.toDataURL();

  // Display the captured photo
  previewImage.src = photoURL;
  fileName.textContent = 'webcam-capture.png';
  stopCapture();
}

// Function to start capturing from the webcam
function startCapture() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((mediaStream) => {
      stream = mediaStream;
      video.srcObject = mediaStream;
      isCapturing = true;
    })
    .catch((error) => {
      console.error('Error accessing webcam:', error);
    });
}

// Function to stop capturing from the webcam
function stopCapture() {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    video.srcObject = null;
    stream = null;
    isCapturing = false;
  }
}

// Event listener for image upload
imageUpload.addEventListener('change', function (event) {
  const file = event.target.files[0];
  fileName.textContent = file ? file.name : '';
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      previewImage.src = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    previewImage.src = '';
  }
});

// Event listener for submit button
submitButton.addEventListener('click', function () {
  const file = imageUpload.files[0];
  const formData = new FormData();
  formData.append('image', file);

  fetch('/process_image', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        nidNumber.textContent = data.error;
        previewImage.src = ''; // Clear the preview image
      } else {
        const result = data.result;
        const lastResult = result[result.length - 1];
        nidNumber.textContent = `NID Number:\n${lastResult}`;
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

// Event listener for capture button
captureButton.addEventListener('click', function () {
  if (!isCapturing) {
    startCapture();
    captureButton.textContent = 'Capture';
  } else {
    capturePhoto();
  }
});
