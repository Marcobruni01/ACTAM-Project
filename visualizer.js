// Impostazioni del canvas
console.log("visualizer.js è stato caricato correttamente");
const visualizerCanvas = document.getElementById('canvas1');
visualizerCanvas.width = window.innerWidth;
visualizerCanvas.height = 300;
const visualizerCtx = visualizerCanvas.getContext('2d');

// Variabili per l'audio e il visualizzatore
let audioCtx;
let analyser;
let bufferLength;
let dataArray;
let visualizerBarWidth;
let animationId;

// Variabile per la dissolvenza
let fading = false;

// Funzione di inizializzazione del visualizzatore
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

// Funzione di animazione
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
        analyser.getByteFrequencyData(dataArray);
    }

    drawVisualizer(bufferLength, dataArray, visualizerBarWidth);
    animationId = requestAnimationFrame(animate);
}

function drawVisualizer(bufferLength, dataArray, visualizerBarWidth) {
    let maxBarHeight = Math.min(visualizerCanvas.width, visualizerCanvas.height) / 2 - 10;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let barHeight = Math.min(dataArray[i] * 1.3, maxBarHeight);
        visualizerCtx.save();
        visualizerCtx.translate(visualizerCanvas.width / 2, visualizerCanvas.height / 2);
        visualizerCtx.rotate(i * Math.PI * 10 / bufferLength);

        const hue = i * 0.3;
        visualizerCtx.fillStyle = `hsl(${hue}, 100%, ${barHeight / 3}%)`;

        visualizerCtx.fillRect(0, -barHeight, visualizerBarWidth, barHeight);
        visualizerCtx.restore();
        x += visualizerBarWidth;
    }
}

// Funzione per processare il suono dal JSON
function processNoteFromJSON(noteUrl) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        initVisualizer();

        fetch(noteUrl)
            .then(response => response.arrayBuffer())
            .then(buffer => audioCtx.decodeAudioData(buffer))
            .then(decodedData => {
                const source = audioCtx.createBufferSource();
                source.buffer = decodedData;
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                source.start(0);
                animate();
            })
            .catch(error => console.error("Errore nel processamento della nota:", error));
    } catch (err) {
        console.error("Errore durante l'inizializzazione dell'audio:", err);
    }
}

// Eventi per tastiera e mouse
document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    const note = keyMap[key];

    if (note && setCorrente && setCorrente.suoni[note]) {
        processNoteFromJSON(setCorrente.suoni[note]);
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

