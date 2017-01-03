(function(window) {
    var gotSources = function(sourceInfos) {
        for (var i = sourceInfos.length - 1; i >= 0; --i) {
            var sourceInfo = sourceInfos[i];

            if (sourceInfo.kind === 'video') {
                alert(sourceInfo.id);
                navigator.mediaDevices.getUserMedia({
                    video: {
                        optional: [{
                            sourceId: sourceInfo.id
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
                return;
            } else {
                console.log('Some other kind of source: ', sourceInfo);
            }
        }
    }

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

    window.onload = function() {
        if (typeof MediaStreamTrack === 'undefined' ||
            typeof MediaStreamTrack.getSources === 'undefined'
        ) {
            alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
        } else {
            MediaStreamTrack.getSources(gotSources);
        }
    };

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

})(window);
