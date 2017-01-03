$(function() {
    var videoElement = document.querySelector('video');
    var audioInputSelect = document.querySelector('select#audioSource');
    var audioOutputSelect = document.querySelector('select#audioOutput');
    var videoSelect = document.querySelector('select#videoSource');
    var selectors = [audioInputSelect, audioOutputSelect, videoSelect];

    var handleError = function(error) {
        console.log('navigator.getUserMedia error: ', error);
    };

    var gotDevices = function(deviceInfos) {
        // Handles being called several times to update labels. Preserve values.
        var values = selectors.map(function(select) {
            return select.value;
        });

        selectors.forEach(function(select) {
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
        });

        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label ||
                    'microphone ' + (audioInputSelect.length + 1);
                audioInputSelect.appendChild(option);
            } else if (deviceInfo.kind === 'audiooutput') {
                option.text = deviceInfo.label || 'speaker ' +
                    (audioOutputSelect.length + 1);
                audioOutputSelect.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            } else {
                console.log('Some other kind of source/device: ', deviceInfo);
            }
        }
        selectors.forEach(function(select, selectorIndex) {
            if (Array.prototype.slice.call(select.childNodes).some(function(n) {
                return n.value === values[selectorIndex];
            })) {
                select.value = values[selectorIndex];
            }
        });
    };

    var initCanvas = function(video) {
        var width = video.videoWidth;
        var height = video.videoHeight;

        var canvas = document.getElementById('canvas');
        canvas.width = width;
        canvas.height = height;

        var playback = false;
        var bitmaps = [];
        var context = canvas.getContext('2d');
        var draw = function() {
            requestAnimationFrame(draw);

            createImageBitmap(video, 0, 0, width, height)
            .then(function(bitmap) {
                bitmaps.push(bitmap);
            });

            if (playback && bitmaps.length) {
                var bitmap = bitmaps.length > 2 ? bitmaps.shift() : bitmaps[0];
                context.drawImage(bitmap, 0, 0, width, height);
            }
        };

        requestAnimationFrame(draw);
        setTimeout(function() {
            playback = true;

            var stream = canvas.captureStream(15); // build a 15 fps stream
            var video = document.getElementById('playback');
            video.src = URL.createObjectURL(stream);
            video.play();
        }, 1000);
    };

    var gotStream = function(stream) {
        window.stream = stream; // make stream available to console
        videoElement.srcObject = stream;
        video.addEventListener('loadedmetadata', function() {
            initCanvas(video);
        });
        video.play();

        return navigator.mediaDevices.enumerateDevices();
    };

    var start = function() {
        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }

        var audioSource = audioInputSelect.value;
        var videoSource = videoSelect.value;
        var constraints = {
            audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        };

        navigator.mediaDevices.getUserMedia(constraints)
        .then(gotStream).then(gotDevices).catch(handleError);
    };

    audioInputSelect.onchange = start;
    // audioOutputSelect.onchange = changeAudioDestination;
    videoSelect.onchange = start;

    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

    start();
});
