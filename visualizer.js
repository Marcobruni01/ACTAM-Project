// Impostazioni del canvas
console.log("visualizer.js è stato caricato correttamente");
const visualizerCanvas = document.getElementById('canvas1');
visualizerCanvas.width = window.innerWidth;
visualizerCanvas.height = 300;
const visualizerCtx = visualizerCanvas.getContext('2d');

// Variabili per l'audio
let audioCtx;
let analyser;
let bufferLength;
let dataArray;
let visualizerBarWidth;
let animationId;

// Mappa per memorizzare le sorgenti audio associate agli elementi audio
const audioSourcesMap = new Map();

// Mappa per tracciare i tasti attivi
const activeKeys = new Set();

// Funzione di inizializzazione del visualizzatore per una nota
function initVisualizerForNote(audioElement) {
    console.log("Inizializzazione visualizzatore per la nota", audioElement);

    if (!audioCtx) {
        console.log("Creando nuovo AudioContext");
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.state === 'suspended') {
        console.log("Riprendendo AudioContext sospeso");
        audioCtx.resume();
    }

    // Verifica se l'elemento audio è già associato a una sorgente audio
    let audioSource = audioSourcesMap.get(audioElement);

    if (!audioSource) {
        try {
            audioSource = audioCtx.createMediaElementSource(audioElement);
            audioSourcesMap.set(audioElement, audioSource); // Salva la sorgente nella mappa

            if (!analyser) {
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 2048;
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
                visualizerBarWidth = visualizerCanvas.width / bufferLength;
            }

            audioSource.connect(analyser);
            analyser.connect(audioCtx.destination);
        } catch (error) {
            console.error("Errore durante la creazione della sorgente audio:", error);
            return;
        }
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    animate();
}

// Funzione di animazione
function animate() {
    visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    analyser.getByteFrequencyData(dataArray);
    drawVisualizer(bufferLength, dataArray, visualizerBarWidth);

    animationId = requestAnimationFrame(animate);
}

function drawVisualizer(bufferLength, dataArray, visualizerBarWidth) {
    let maxBarHeight = Math.min(visualizerCanvas.width, visualizerCanvas.height) / 2 - 10; // Massima altezza delle barre
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let barHeight = Math.min(dataArray[i] * 1.3, maxBarHeight); // Limita l'altezza della barra
        visualizerCtx.save();
        visualizerCtx.translate(visualizerCanvas.width / 2, visualizerCanvas.height / 2);
        visualizerCtx.rotate(i * Math.PI * 10 / bufferLength);

        const hue = i * 0.3;
        visualizerCtx.fillStyle = `hsl(${hue}, 100%, ${barHeight / 3}%)`;

        visualizerCtx.fillRect(0, -barHeight, visualizerBarWidth, barHeight); // Disegna verso l'esterno
        visualizerCtx.restore();
        x += visualizerBarWidth;
    }
}


// Rileva la pressione di un tasto e attiva l'animazione
document.addEventListener('keydown', (event) => {
    const key = event.key;
    const audioElement = document.getElementById(`note-${key}`);

    // Controlla se il tasto è già attivo
    if (activeKeys.has(key)) return;

    console.log(`Tasto premuto: ${key}, Codice: ${event.code}`);
    console.log(`Elemento audio trovato:`, audioElement);

    if (audioElement) {
        activeKeys.add(key); // Segna il tasto come attivo
        audioElement.currentTime = 0; 
        audioElement.play();
        initVisualizerForNote(audioElement);
    } else {
        console.log(`Elemento audio con ID 'note-${key}' non trovato.`);
    }
});

// Rilascia il tasto e ferma l'animazione se necessario
document.addEventListener('keyup', (event) => {
    const key = event.key;

    if (activeKeys.has(key)) {
        activeKeys.delete(key); // Rimuovi il tasto dalla lista dei tasti attivi
    }
});

// Interrompi l'animazione e il suono se l'audio termina
document.querySelectorAll('audio').forEach(audioElement => {
    audioElement.addEventListener('ended', () => {
        cancelAnimationFrame(animationId);
        animationId = null;
    });
});


