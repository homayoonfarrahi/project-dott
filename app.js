var context = null;
var floatData = false;
window.addEventListener('load', init, false);

var loadSong = function(fileName) {
	var audio = new Audio();
	audio.src = fileName;
	audio.controls = true;
	audio.autoplay = false;
	document.body.appendChild(audio);
	playSong(audio);
};

var playSong = function(audio) {
	var prevFrameCount = 0;
    var currFrameCount = 0;
    var deltaFrameCount = 0;
    var targetVelocityStart = 5;        // is set to default value (1) when song starts to play
    var targetVelocityEnd = 5;
    var lerpFactor = 0.05;
    var guiderDistance = 500;
    var guiderRadius = 20;
    var targetRadius = 60;
    var mouse = new Two.Vector();

    //*
    var dancer = new Dancer();
    dancer.load(audio);
    //dancer.setVolume(0);
    // dancer.play();


    var kickColor = 'rgba(0, 10, 255, 1)';
    kick = dancer.createKick({
    	frequency: [0, 10],
    	threshold: 0.4,
    	decay: 0.02,
    	onKick: function(mag) {
    		//console.log('kick: ' + mag);
    		kickColor = 'rgba(100, 10, 200, 0.5)';

            deltaFrameCount = currFrameCount - prevFrameCount;
            prevFrameCount = currFrameCount;
    	},
    	offKick: function(mag) {
    		kickColor = 'rgba(200, 10, 100, 0.5)';
    	}
    }).on();


	// setup graphic objects// Make an instance of two and place it on the page.
	var elem = document.getElementById('draw-shapes').children[0];
	var params = { type: Two.Types['webgl'], fullscreen: true, autostart: true };
	var two = new Two(params).appendTo(elem);
    console.log(two.width, two.height);

    var width = two.width;
    var height = 667;       // FIXME: change it later to two.height (showing dev console in browser changes height)
    var curvePointCount = 64;
    var curvePoints = [];

    // make the points for the path
    for (var i=0 ; i<curvePointCount ; ++i) {

        var randWidth = Math.random() * ((9/10) * width) + ((5/100) * width);
        while (randWidth > (width / 2) - (5/100) * width && randWidth < (width / 2) + (5/100) * width)
            var randWidth = Math.random() * ((9/10) * width) + ((5/100) * width);

        var randHeight = Math.random() * ((9/10) * height) + ((5/100) * height);
        while (randHeight > (height / 2) - (5/100) * height && randHeight < (height / 2) + (5/100) * height)
            var randHeight = Math.random() * ((9/10) * height) + ((5/100) * height);

        curvePoints.push(new Two.Anchor(randWidth, randHeight));
    }

    var path = two.makeCurve(curvePoints, true);
    path.noFill().linewidth = 15;
    path.cap = path.join = 'round';
    path.stroke = 'lightblue';
    // path.visible = false;

    var guiderBall = two.makeCircle(curvePoints[0].x + path.translation.x, curvePoints[0].y + path.translation.y, guiderRadius);
    guiderBall.fill = 'rgba(200, 10, 100, 0.5)';
    guiderBall.noStroke();

    var targetBall = two.makeCircle(curvePoints[0].x + path.translation.x, curvePoints[0].y + path.translation.y, targetRadius);
    targetBall.fill = 'rgba(200, 10, 10, 0.5)';
    targetBall.noStroke();


    var $window = $(window)
        .bind('mousemove', function(e) {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        })
        .bind('touchstart', function() {
          e.preventDefault();
          return false;
        })
        .bind('touchmove', function(e) {
          e.preventDefault();
          var touch = e.originalEvent.changedTouches[0];
          mouse.x = touch.pageX;
          mouse.y = touch.pageY;
          return false;
        });


    var guiderPlaceOnPath = 0;
	// start the animation loop
	two.bind('update', function(frameCount, timeDelta) {

        if (isNaN(audio.duration) || isNaN(audio.currentTime))
            return;

        var currTargetVelocity = ((audio.currentTime / audio.duration) * (targetVelocityEnd - targetVelocityStart)) + targetVelocityStart;

        if (isNaN(currTargetVelocity))
            currTargetVelocity = targetVelocityStart;

        guiderPlaceOnPath += currTargetVelocity / path.length;

        if (isNaN(guiderPlaceOnPath) || guiderPlaceOnPath === undefined)
            guiderPlaceOnPath = 0;

        if (guiderPlaceOnPath === 1)
            guiderPlaceOnPath = 0.999999999;

        var guiderPos = new Two.Anchor();
        path.getPointAt(guiderPlaceOnPath, guiderPos);
        guiderPos.addSelf(path.translation);

        if (guiderPos.x < 0)
            guiderPos.x *= -1;
        else if (guiderPos.x > width)
            guiderPos.x = width - (guiderPos.x - width);

        if (guiderPos.y < 0)
            guiderPos.y *= -1;
        else if (guiderPos.y > height)
            guiderPos.y = height - (guiderPos.y - height);

        var guiderLerpPoint = guiderBall.translation.lerp(guiderPos, lerpFactor);
        guiderBall.translation.set(guiderLerpPoint.x, guiderLerpPoint.y);


        // set up target position
        if (guiderPlaceOnPath * path.length > guiderDistance) {
            if (!dancer.isPlaying())
                dancer.play();

            targetVelocityStart = 1;

            var targetPlaceOnPath = guiderPlaceOnPath - (guiderDistance / path.length);
            var targetPos = new Two.Anchor();
            path.getPointAt(targetPlaceOnPath, targetPos);
            targetPos.addSelf(path.translation);

            if (targetPos.x < 0)
                targetPos.x *= -1;
            else if (targetPos.x > width)
                targetPos.x = width - (targetPos.x - width);

            if (targetPos.y < 0)
                targetPos.y *= -1;
            else if (targetPos.y > height)
                targetPos.y = height - (targetPos.y - height);

            var targetLerpPoint = targetBall.translation.lerp(targetPos, lerpFactor);
            targetBall.translation.set(targetLerpPoint.x, targetLerpPoint.y);
        }

        // check if mouse or touch is on target
        if (targetBall.translation.distanceTo(mouse) <= targetRadius)
            targetBall.fill = 'rgba(10, 200, 10, 0.5)';
        else
            targetBall.fill = 'rgba(200, 10, 10, 0.5)';

	}).play();
};

function init() {
	try {
		// fix up for prefixing
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();
		loadSong('./songs/getlucky.mp3');
	}
	catch(e) {
		console.log(e.message);
		console.log(e.stack);
		//alert('Web Audio API is not supported in this browser');
	}
}