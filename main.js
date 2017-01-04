$(function() {
    var videoElement = document.querySelector('video');
    var videoSelect = document.querySelector('select#videoSource');
    var selectors = [videoSelect];

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
            if (deviceInfo.kind === 'videoinput') {
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

    var gotStream = function(stream) {
        window.stream = stream;
        videoElement.srcObject = stream;
        return navigator.mediaDevices.enumerateDevices();
    };

    var start = function() {
        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }

        var videoSource = videoSelect.value;
        var constraints = {
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        };

        navigator.mediaDevices.getUserMedia(constraints)
        .then(gotStream).then(gotDevices).catch(handleError);

        $('#videoSource').remove();
    };

    videoSelect.onchange = start;

    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
    setTimeout(function() {
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
    }, 1000);
});
