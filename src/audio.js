
export function initializeAudio() {
    return new Promise((resolve, reject) => {
        // Create an AudioContext and AnalyserNode
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();

        // Get microphone input
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function(stream) {
                // Create a MediaStreamSourceNode
                const source = audioContext.createMediaStreamSource(stream);
                // Connect it to the analyser node
                source.connect(analyser);

                resolve(analyser); // Resolve the promise with the analyser node
            })
            .catch(function(err) {
                console.log('The following error occurred: ');
                console.log(err);
                reject(err); // Reject the promise with the error
            });
    });
}


