// Canvas settings
console.log("visualizer.js è stato caricato correttamente");
const visualizerCanvas = document.getElementById('canvas1');
visualizerCanvas.width = window.innerWidth;
visualizerCanvas.height = 300;
const visualizerCtx = visualizerCanvas.getContext('2d');// Get the 2D rendering context for the canvas

// Variables for audio and the visualizer
let audioCtx;
let analyser;
let bufferLength;
let dataArray;
let visualizerBarWidth;
let animationId;

// Variable for fading
let fading = false;

// Function to initialize the visualizer
function initVisualizer() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (!analyser) {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        visualizerBarWidth = visualizerCanvas.width / bufferLength;
    }
}


// Animation function
function animate() {
    visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    if (fading) {
        dataArray = dataArray.map(value => Math.max(0, value - 2));
        if (dataArray.every(value => value === 0)) {
            fading = false;
            cancelAnimationFrame(animationId);
            animationId = null;
            return;
        }
    } else {
        analyser.getByteFrequencyData(dataArray);// Get frequency data from the analyser
    }

    drawVisualizer(bufferLength, dataArray, visualizerBarWidth);// Draw the visualizer
    animationId = requestAnimationFrame(animate);
}

//Draws the visualizer bars on the canvas. Bars are arranged in a circular pattern with their height and color determined by frequency data.
function drawVisualizer(bufferLength, dataArray, visualizerBarWidth) {
    let maxBarHeight = Math.min(visualizerCanvas.width, visualizerCanvas.height) / 2 - 10;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let barHeight = Math.min(dataArray[i] * 1.3, maxBarHeight);
        visualizerCtx.save();
        visualizerCtx.translate(visualizerCanvas.width / 2, visualizerCanvas.height / 2); // Center the bars
        visualizerCtx.rotate(i * Math.PI * 10 / bufferLength); // Arrange bars in a circular pattern

        const hue = i * 0.3;// Generate a unique hue for each bar
        visualizerCtx.fillStyle = `hsl(${hue}, 100%, ${barHeight / 3}%)`;// Set bar color
        visualizerCtx.fillRect(0, -barHeight, visualizerBarWidth, barHeight); // Draw the bar
        visualizerCtx.restore();
        x += visualizerBarWidth;// Increment x position for the next bar
    }
}


//Processes a note provided via a JSON URL by decoding its audio data, playing it, and triggering the visualizer animation.
function processNoteFromJSON(noteUrl) {
    if (!visualizerEnabled) {
        console.log("Il visualizer è disattivato. Nessuna nota verrà processata.");
        return;
    }

    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        initVisualizer();

        fetch(noteUrl)
            .then(response => response.arrayBuffer())// Fetch audio data as an array buffer
            .then(buffer => audioCtx.decodeAudioData(buffer))// Decode the audio data
            .then(decodedData => {
                const source = audioCtx.createBufferSource();// Create an audio source
                source.buffer = decodedData;
                source.connect(analyser);// Connect the source to the analyser
                analyser.connect(audioCtx.destination); // Connect the analyser to the output
                source.start(0);// Start playing the audio
                animate();
            })
            .catch(error => console.error("Errore nel processamento della nota:", error));
    } catch (err) {
        console.error("Errore durante l'inizializzazione dell'audio:", err);
    }
}


// Keyboard and mouse events for triggering notes
document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    const note = keyMap[key];

    if (note && setCorrente && setCorrente.suoni[note]) {
        processNoteFromJSON(setCorrente.suoni[note]);// Process the note
    }
});

document.querySelectorAll('.tasto, .tasto-nero').forEach(keyElement => {
    keyElement.addEventListener('mousedown', function () {
        const note = this.getAttribute('data-note');
        if (note && setCorrente && setCorrente.suoni[note]) {
            processNoteFromJSON(setCorrente.suoni[note]);
        }
    });
});

let visualizerEnabled = true; // Flag to control visualizer state

//Disables the visualizer by stopping animations, clearing the canvas, and closing the audio context.
function disableVisualizer() {
    console.log("Disattivazione del visualizer...");
    visualizerEnabled = false;
    if (animationId) {
        cancelAnimationFrame(animationId);// Stop animations
        animationId = null;
    }
    fading = false;
    visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);// Clear the canvas
    if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().then(() => {
            
            audioCtx = null;
            analyser = null;
        }).catch(err => console.error("Errore durante la chiusura del contesto audio:", err));
    }
}


//Enables the visualizer by initializing it and restarting the animation.
function enableVisualizer() {
    if (!visualizerEnabled) {
        visualizerEnabled = true;
        initVisualizer();
        animate();
    }
}

// Toggle visualizer on button click
document.getElementById('toggleVisualizer').addEventListener('click', function () {
    console.log("Pulsante cliccato. Stato visualizer:", visualizerEnabled);
    if (visualizerEnabled) {
        this.textContent = 'Enable Visualizer';
        disableVisualizer();
    } else {
        this.textContent = 'Disable Visualizer';
        enableVisualizer();
    }
});
