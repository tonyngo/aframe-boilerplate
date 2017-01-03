$(function() {
    var gotSources = function(sourceInfos) {
        for (var i = 0; i !== sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            var option = document.createElement('option');
            option.value = sourceInfo.id;
            if (sourceInfo.kind === 'audio') {
                option.text = sourceInfo.label || 'microphone ' +
                (audioSelect.length + 1);
                $audioSelect[0].appendChild(option);
            } else if (sourceInfo.kind === 'video') {
                option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
                $videoSelect[0].appendChild(option);
            } else {
                console.log('Some other kind of source: ', sourceInfo);
            }
        }
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

    var start = function() {
        console.log($audioSelect);
        var audioSourceId = $audioSelect.val();
        var videoSourceId = $videoSelect.val();

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        navigator.mediaDevices.getUserMedia({
            audio: {
                optional: [{
                    sourceId: audioSourceId
                }]
            },
            video: {
                optional: [{
                    sourceId: videoSourceId
                }]
            }
        })
        .then(function(stream) {
            var video = document.createElement('video');
            video.src = URL.createObjectURL(stream);
            video.addEventListener('loadedmetadata', function() {
                initCanvas(video);
            });
            video.play();
        });
    };

    var $audioSelect = $('#audioSource');
    var $videoSelect = $('#videoSource');

    $audioSelect.change(start);
    $videoSelect.change(start);

    if (typeof MediaStreamTrack === 'undefined' ||
        typeof MediaStreamTrack.getSources === 'undefined'
    ) {
        alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
    } else {
        MediaStreamTrack.getSources(gotSources);
    }
});
