var context = null;
var floatData = false;
window.addEventListener('load', init, false);

var loadSong = function(fileName) {
	var audio = new Audio();
	audio.src = fileName;
	audio.controls = true;
	audio.autoplay = true;
	document.body.appendChild(audio);
	playSong(audio);
};

var playSong = function(audio) {
	var prevFrameCount = 0;
    var currFrameCount = 0;
    var deltaFrameCount = 0;
    var targetVelocityStart = 1;
    var targetVelocityEnd = 5;
    var lerpFactor = 0.05;

    //*
    var dancer = new Dancer();
    dancer.load(audio);
    //dancer.setVolume(0);
    dancer.play();


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
    var regions = ['topright', 'topleft', 'bottomleft', 'bottomright'];
    for (var i=0 ; i<curvePointCount ; ++i) {

        var randWidth = Math.random() * ((9/10) * width) + ((5/100) * width);
        while (randWidth > (width / 2) - (5/100) * width && randWidth < (width / 2) + (5/100) * width)
            var randWidth = Math.random() * ((9/10) * width) + ((5/100) * width);

        var randHeight = Math.random() * ((9/10) * height) + ((5/100) * height);
        while (randHeight > (height / 2) - (5/100) * height && randHeight < (height / 2) + (5/100) * height)
            var randHeight = Math.random() * ((9/10) * height) + ((5/100) * height);

        curvePoints.push(new Two.Anchor(randWidth, randHeight));
        // if (Math.random() > 0.5)
        //     curvePoints.push(new Two.Anchor(randWidth, 333));
        // else
        //     curvePoints.push(new Two.Anchor(768, randHeight));

        // var curvePoint = two.makeCircle(randWidth, randHeight, 20);
        // curvePoint.fill = 'rgba(100, 10, 200, 0.5)';
        // curvePoint.noStroke();
    }

    var path = two.makeCurve(curvePoints, true);
    path.noFill().linewidth = 15;
    path.cap = path.join = 'round';
    path.stroke = 'lightblue';


    var targetBall = two.makeCircle(650, 300, 60);
    targetBall.fill = 'rgba(200, 10, 100, 0.5)';
    targetBall.noStroke();

    var placeOnPath = 0;
	// start the animation loop
	two.bind('update', function(frameCount, timeDelta) {

        if (isNaN(audio.duration) || isNaN(audio.currentTime))
            return;

        var currTargetVelocity = ((audio.currentTime / audio.duration) * (targetVelocityEnd - targetVelocityStart)) + targetVelocityStart;

        if (isNaN(currTargetVelocity))
            currTargetVelocity = targetVelocityStart;

        placeOnPath += currTargetVelocity / path.length;

        if (isNaN(placeOnPath) || placeOnPath === undefined)
            placeOnPath = 0;

        if (placeOnPath === 1)
            placeOnPath = 0.999999999;

        var point = new Two.Anchor();
        path.getPointAt(placeOnPath, point);
        point.addSelf(path.translation);

        if (point.x < 0)
            point.x *= -1;
        else if (point.x > width)
            point.x = width - (point.x - width);

        if (point.y < 0)
            point.y *= -1;
        else if (point.y > height)
            point.y = height - (point.y - height);

        var lerpPoint = targetBall.translation.lerp(point, lerpFactor);
        console.log(lerpPoint);
        targetBall.translation.set(lerpPoint.x, lerpPoint.y);
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