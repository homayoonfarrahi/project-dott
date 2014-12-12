var context = null
var songBuffer = null
var floatData = false
window.addEventListener('load', init, false)

var loadSong = function(url) {
	var request = new XMLHttpRequest()
	request.open('GET', url, true)
	request.responseType = 'arraybuffer'
	
	// Decode asynchronously
	request.onload = function() {
		context.decodeAudioData(request.response, function (buffer) {
			songBuffer = buffer
			playSong(songBuffer)
		}, function(error) {
			console.log(error)
		})
	}
	
	request.send()
}

var playSong = function(buffer) {
	var source = context.createBufferSource()   // creates a sound source
	source.buffer = buffer                      // tell the source which sound to play

	var analyser = context.createAnalyser()
	analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0
    analyser.maxDecibels = 0
    //analyser.minDecibels = -130
    if (!floatData)
        var frequencyData = new Uint8Array(analyser.frequencyBinCount)
    else
        var frequencyData = new Float32Array(analyser.frequencyBinCount)

	source.connect(analyser)                    // connect the source to the analyser
	analyser.connect(context.destination)       // connect the analyser to audio context destination (speakers)



	// setup graphic objects// Make an instance of two and place it on the page.
	var elem = document.getElementById('draw-shapes').children[0];
	var params = { fullscreen: true, autostart: true };
	var two = new Two(params).appendTo(elem);
    var barGroup = two.makeGroup()

	for (var i=0 ; i<analyser.frequencyBinCount ; ++i) {
        var barWidth = (window.innerWidth - 20) / analyser.frequencyBinCount
        var bar = two.makeLine(10 + i*barWidth, 650, 10 + i*barWidth, 648)
        bar.fill = 'rgba(255, 127, 0, 0.75)'
        bar.linewidth = barWidth * 0.5
        bar.stroke = 'rgba(255, 10, 0, 1)'
        bar.addTo(barGroup)
    }

	// start the animation loop
	two.bind('update', function(frameCount) {
        if (!floatData)
            analyser.getByteFrequencyData(frequencyData)
        else
            analyser.getFloatFrequencyData(frequencyData)

        var index = 0
        for(i in barGroup.children) {
            var bar = barGroup.children[i]
            var vertex = bar.vertices[1]
            if (!floatData)
                vertex.set(vertex.x, -(3 * frequencyData[index]))
            else
                vertex.set(vertex.x, -6 * (frequencyData[index] + 100))
            index++
        }
	}).play()


	
	source.start(0)                             // play the source now
												// note: on older systems, may have to use deprecated noteOn(time)
}

function init() {
	try {
		// fix up for prefixing
		window.AudioContext = window.AudioContext || window.webkitAudioContext
		context = new AudioContext()
		loadSong('http://localhost:8000/getlucky')
	}
	catch(e) {
		alert('Web Audio API is not supported in this browser')
	}
}