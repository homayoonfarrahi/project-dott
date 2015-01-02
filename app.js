var AudioManager = function() {
    audio = new Audio();
    audio.src = './songs/getlucky.mp3';
    audio.controls = true;
    audio.autoplay = false;
    document.body.appendChild(audio);

    AudioManager.prototype.getAudio = function() {
        return audio;
    }

    AudioManager.prototype.getAudioDuration = function() {
        return audio.duration;
    }

    AudioManager.prototype.getAudioCurrentTime = function() {
        return audio.currentTime;
    }
}


var Gameplay = function(two, audioManager) {
    var width = two.width;
    var height = 667;       // FIXME: change it later to two.height (showing dev console in browser changes height)
    var pathPointCount = 64;
    var guideBallRadius = 20;
    var targetBallRadius = 60;
    var pathPoints = [];
    var velocityStart = 5;        // is set to default value (1) when song starts to play
    var velocityEnd = 5;
    var guidePlaceOnPath = 0;
    var lerpFactor = 0.05;
    var guideTrackLines = [];
    var guideTrackLength = 0;
    var guideToTargetDistance = 500;
    var mouse = new Two.Vector();

    var visualizer = null;

    Gameplay.prototype.setVisualizer = function(vis) {
        visualizer = vis;
    }

    Gameplay.prototype.setMousePos = function(x, y) {
        mouse.x = x;
        mouse.y = y;
    }

    // make the points for the path
    for (var i=0 ; i<pathPointCount ; ++i) {

        var randWidth = Math.random() * ((9/10) * width) + ((5/100) * width);
        while (randWidth > (width / 2) - (5/100) * width && randWidth < (width / 2) + (5/100) * width)
            var randWidth = Math.random() * ((9/10) * width) + ((5/100) * width);

        var randHeight = Math.random() * ((9/10) * height) + ((5/100) * height);
        while (randHeight > (height / 2) - (5/100) * height && randHeight < (height / 2) + (5/100) * height)
            var randHeight = Math.random() * ((9/10) * height) + ((5/100) * height);

        pathPoints.push(new Two.Anchor(randWidth, randHeight));
    }

    // make the path
    var path = two.makeCurve(pathPoints, true);
    path.noFill().linewidth = 15;
    path.cap = path.join = 'round';
    path.stroke = 'lightblue';
    path.opacity = 0;           // FIXME: have put this here because of following line
    path.visible = false;       // FIXME: with canvas drawing path.visible = false; doesn't work

    var guideBall = two.makeCircle(pathPoints[0].x + path.translation.x, pathPoints[0].y + path.translation.y, guideBallRadius);
    guideBall.fill = 'rgba(200, 10, 100, 0.5)';
    guideBall.noStroke();

    var targetBall = two.makeCircle(pathPoints[0].x + path.translation.x, pathPoints[0].y + path.translation.y, targetBallRadius);
    targetBall.fill = 'rgba(200, 10, 10, 0.5)';
    targetBall.noStroke();


    Gameplay.prototype.update = function(frameCount, timeDelta) {
        // FIXME: audio.duration has to always be available (currently it's not available for some songs)
        // if (!isFinite(audioManager.getAudioDuration()))
        //     console.log('audio duration is not right');

        var velocity = ((audioManager.getAudioCurrentTime() / audioManager.getAudioDuration()) * (velocityEnd - velocityStart)) + velocityStart;

        if (isNaN(velocity))
            velocity = velocityStart;

        var timeDeltaCorrection = timeDelta / (1000 / 60);
        guidePlaceOnPath += (velocity * timeDeltaCorrection) / path.length;

        if (isNaN(guidePlaceOnPath) || guidePlaceOnPath === undefined)
            guidePlaceOnPath = 0;

        if (guidePlaceOnPath === 1)
            guidePlaceOnPath = 0.999999999;

        var guidePos = new Two.Anchor();
        path.getPointAt(guidePlaceOnPath, guidePos);
        guidePos.addSelf(path.translation);

        // fix the position when the path goes off the edges of the screen
        if (guidePos.x < targetBallRadius)
            guidePos.x = targetBallRadius + (targetBallRadius - guidePos.x);
        else if (guidePos.x > width - targetBallRadius)
            guidePos.x = (width - targetBallRadius) - (guidePos.x - (width - targetBallRadius));

        if (guidePos.y < targetBallRadius)
            guidePos.y = targetBallRadius + (targetBallRadius - guidePos.y);
        else if (guidePos.y > height - targetBallRadius)
            guidePos.y = (height - targetBallRadius) - (guidePos.y - (height - targetBallRadius));

        var prevGuidePos = new Two.Vector(guideBall.translation.x, guideBall.translation.y);
        var guideLerpPoint = guideBall.translation.lerp(guidePos, lerpFactor);

        // make the lines for the guideTrack
        var trackLine = two.makeLine(prevGuidePos.x, prevGuidePos.y, guideLerpPoint.x, guideLerpPoint.y);
        guideTrackLines.push(trackLine);
        trackLine.stroke = 'grey';
        trackLine.cap = path.join = 'round';
        trackLine.linewidth = 3;
        trackLine.opacity = 0.1;
        guideTrackLength += trackLine.length;

        // set up target position
        if (guidePlaceOnPath * path.length > guideToTargetDistance) {
            if (!visualizer.isDancerPlaying())
                visualizer.playDancer();

            velocityStart = 1;

            var targetPlaceOnPath = guidePlaceOnPath - (guideToTargetDistance / path.length);
            var targetPos = new Two.Anchor();
            path.getPointAt(targetPlaceOnPath, targetPos);
            targetPos.addSelf(path.translation);

            // fix the position when the path goes off the edges of the screen
            if (targetPos.x < targetBallRadius)
                targetPos.x = targetBallRadius + (targetBallRadius - targetPos.x);
            else if (targetPos.x > width - targetBallRadius)
                targetPos.x = (width - targetBallRadius) - (targetPos.x - (width - targetBallRadius));

            if (targetPos.y < targetBallRadius)
                targetPos.y = targetBallRadius + (targetBallRadius - targetPos.y);
            else if (targetPos.y > height - targetBallRadius)
                targetPos.y = (height - targetBallRadius) - (targetPos.y - (height- targetBallRadius));

            var targetLerpPoint = targetBall.translation.lerp(targetPos, lerpFactor);

            // remove the extra length of guide track
            while (guideTrackLength > guideToTargetDistance) {
                var wasteLine = guideTrackLines.shift();        // FIXME: probably array shift here is eating a lot of performance
                guideTrackLength -= wasteLine.length;
                wasteLine.remove();
                Two.Utils.release(wasteLine);
            }
        }

        // check if mouse or touch is on target
        if (targetBall.translation.distanceTo(mouse) <= targetBallRadius)
            targetBall.fill = 'rgba(10, 200, 10, 0.5)';
        else
            targetBall.fill = 'rgba(200, 10, 10, 0.5)';
    }
}


var Visualizer = function(two, audioManager) {
    dancer = new Dancer();
    dancer.load(audioManager.getAudio());

    var width = two.width;
    var height = 667;       // FIXME: change it later to two.height (showing dev console in browser changes height)
    var visualizationBallCount = 32;
    var maxBallOpacity = 0.8;
    var balls = [];

    Visualizer.prototype.isDancerPlaying = function() {
        return dancer.isPlaying();
    }

    Visualizer.prototype.playDancer = function() {
        return dancer.play();
    }

    // generate visualization balls
    for (var i=0 ; i<visualizationBallCount ; ++i) {
        var randRadius = Math.random() * 10 + 20;
        var randWidth = Math.random() * (width - (2 * randRadius)) + randRadius;
        var randHeight = Math.random() * (height - (2 * randRadius)) + randRadius;
        var ball = two.makeCircle(randWidth, randHeight, randRadius);
        ball.fill = 'rgba(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.random() * maxBallOpacity + ')';
        ball.noStroke();

        randVelX = Math.random() * 1 - 0.5;
        randVelY = Math.random() * 1 - 0.5;
        ball.velocity = new Two.Anchor(randVelX, randVelY);

        beatMag = 0;
        balls.push(ball);
    }

    var kickColor = 'rgba(0, 10, 255, 1)';
    kick = dancer.createKick({
        frequency: [0, 10],
        // threshold: 0.3,
        // decay: 0.02,
        onKick: function(mag) {
            // console.log('kick: ' + mag);
            kickColor = 'rgba(100, 10, 200, 0.5)';
            beatMag = mag;
        },
        offKick: function(mag) {
            // console.log('offkick: ' + mag);
            kickColor = 'rgba(200, 10, 100, 0.5)';
        }
    }).on();


    Visualizer.prototype.update = function(frameCount, timeDelta) {
        var timeDeltaCorrection = timeDelta / (1000 / 60);
        if (!isFinite(timeDeltaCorrection))
            timeDeltaCorrection = 1;

        // update the balls
        for (var i=0 ; i<balls.length ; ++i) {
            if (balls[i].translation.x < 0)
                balls[i].velocity.x = Math.abs(balls[i].velocity.x);
            else if (balls[i].translation.x > width)
                balls[i].velocity.x = -Math.abs(balls[i].velocity.x);

            if (balls[i].translation.y < 0)
                balls[i].velocity.y = Math.abs(balls[i].velocity.y);
            else if (balls[i].translation.y > height)
                balls[i].velocity.y = -Math.abs(balls[i].velocity.y);

            var velocity = new Two.Anchor(balls[i].velocity.x, balls[i].velocity.y);
            velocity.multiplyScalar(timeDeltaCorrection);
            balls[i].translation.addSelf(velocity);

            if (2 + beatMag - balls[i].scale > 0.5)
                balls[i].scale += (2 + beatMag - balls[i].scale) * 0.3;
            else {
                beatMag = -1;
                balls[i].scale += (2 + beatMag - balls[i].scale) * 0.1;
            }

        }
    }
}


window.onload = function init() {
	try {
        var elem = document.getElementById('draw-shapes').children[0];
        var params = { type: Two.Types['canvas'], fullscreen: true, autostart: true };
        var two = new Two(params).appendTo(elem);

        var audioManager = new AudioManager();
        var gameplay = new Gameplay(two, audioManager);
        var visualizer = new Visualizer(two, audioManager);

        gameplay.setVisualizer(visualizer);

        var $window = $(window)
            .bind('mousemove', function(e) {
                gameplay.setMousePos(e.clientX, e.clientY);
            })
            .bind('touchstart', function() {
                e.preventDefault();
                return false;
            })
            .bind('touchmove', function(e) {
                e.preventDefault();
                var touch = e.originalEvent.changedTouches[0];
                gameplay.setMousePos(e.clientX, e.clientY);
                return false;
            });

        // start the animation loop
        two.bind('update', function(frameCount, timeDelta) {
            gameplay.update(frameCount, timeDelta);
            visualizer.update(frameCount, timeDelta);
        }).play();
	}
	catch(e) {
		console.log(e.message);
		console.log(e.stack);
		//alert('Web Audio API is not supported in this browser');
	}
}