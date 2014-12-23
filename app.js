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
    var velocityTheta = 0;

    //*
    var dancer = new Dancer();
    dancer.load(audio);
    //dancer.setVolume(0);
    dancer.play();

	/*
    dancer.onceAt(5, function() {
		var audio2 = new Audio();
		audio2.src = './songs/getlucky.mp3';
		audio2.controls = true;
		audio2.autoplay = true;
		document.body.appendChild(audio2);

	    var dancer2 = new Dancer();
	    dancer2.load(audio2);
	    console.log(dancer2.isLoaded());
	    dancer2.play();
	    console.log(dancer2.isPlaying());
    });
    //*/


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
    var barGroup = two.makeGroup();
/*
    var tempSpectrum = dancer.getSpectrum();
	for (var i=0 ; i<tempSpectrum.length ; ++i) {
        var barWidth = (window.innerWidth - 20) / tempSpectrum.length;
        var bar = two.makeLine(10 + i*barWidth, 650, 10 + i*barWidth, 648);
        bar.fill = 'rgba(255, 127, 0, 0.75)';
        bar.linewidth = barWidth * 0.5;
        bar.stroke = 'rgba(255, 10, 0, 1)';
        bar.addTo(barGroup);
    }
*/

    var targetBall = two.makeCircle(650, 300, 60);
    targetBall.fill = 'rgba(200, 10, 100, 0.5)';
    targetBall.noStroke();

    var curve = two.makeCurve(650, 300, 850, 300, 850, 525, 725, 550, true);
    curve.noFill().linewidth = 15;
    curve.cap = curve.join = 'round';
    curve.stroke = 'lightblue';
    console.log(curve);

    // var curve2 = two.makeCurve(850, 450, 850, 525, 825, 550, true);
    // curve2.noFill().linewidth = 15;
    // curve2.cap = curve2.join = 'round';
    // curve2.stroke = 'pink';
    // console.log(curve2);


    curve.getPointAt(0.5, targetBall.translation);
    targetBall.translation.addSelf(curve.translation);

    var targetBallVelocity = new Two.Vector(1, 0);

	// start the animation loop
	two.bind('update', function(frameCount, timeDelta) {
		currFrameCount = frameCount;

        //console.log(frameCount);
        //if (timeDelta > 17)
            //console.log(timeDelta);
		//var frequencyData = dancer.getSpectrum();

		/*
        var index = 0;
        for(i in barGroup.children) {
            var bar = barGroup.children[i];
            if (index >= 0 && index < 70)
				bar.stroke = kickColor;

            var vertex = bar.vertices[1];
            vertex.set(vertex.x, -700 * (frequencyData[index]));

            index++;
        }
        //*/

        if (deltaFrameCount > 120)
            deltaFrameCount = 0;
        var dirChangeFactor = (deltaFrameCount / 800) + 0.005;
        //console.log(dirChangeFactor);

        var sign = Math.floor(frameCount / 300) % 2 == 0 ? 1 : -1;
        velocityTheta = velocityTheta + (sign * dirChangeFactor);
        targetBallVelocity.set(Math.cos(velocityTheta), Math.sin(velocityTheta));
        //console.log(targetBallVelocity);
        
        var temp = 1;
        if (timeDelta !== undefined)
            temp = parseFloat(((timeDelta / 16.67).toFixed(2)));

        targetBall.translation.set(targetBall.translation.x + targetBallVelocity.x * temp, targetBall.translation.y + targetBallVelocity.y * temp);
        if (targetBall.translation.x < 50 || targetBall.translation.x > 1300) {
            //targetBallVelocity.x = -targetBallVelocity.x;
            velocityTheta += Math.PI;
            targetBallVelocity.set(Math.cos(velocityTheta), Math.sin(velocityTheta));
        }

        if (targetBall.translation.y < 50 || targetBall.translation.y > 600) {
            //targetBallVelocity.y = -targetBallVelocity.y;
            velocityTheta += Math.PI;
            targetBallVelocity.set(Math.cos(velocityTheta), Math.sin(velocityTheta));
        }

        targetBall.fill = kickColor;

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