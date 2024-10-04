// Crea un contesto audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer;
let currentSource = null; // Variabile per tracciare la sorgente audio corrente

// Funzione per caricare e decodificare il file MP3
async function loadAudio(file) {
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

// Funzione per ottenere il valore di pitch dalla nota
function getPitchFromNote(note) {
    const notes = {
        "C": 261.63, // Do
        "C#": 277.18, // Do diesis
        "D": 293.66, // Re
        "D#": 311.13, // Re diesis
        "E": 329.63, // Mi
        "F": 349.23, // Fa
        "F#": 369.99, // Fa diesis
        "G": 392.00, // Sol
        "G#": 415.30, // Sol diesis
        "A": 440.00, // La
        "A#": 466.16, // La diesis
        "B": 493.88  // Si
    };

    // Usa il La (A) come nota di riferimento (440 Hz)
    const baseFrequency = 440.00; 
    const targetFrequency = notes[note];

    // Calcola il rapporto tra la frequenza della nota selezionata e quella del La
    return targetFrequency / baseFrequency;
}

// Funzione per riprodurre l'audio con un pitch modificato
function playAudio(note) {
    if (!audioBuffer) {
        console.error("Audio buffer non caricato.");
        return;
    }

    // Ferma l'audio corrente se è in riproduzione
    if (currentSource) {
        currentSource.stop();
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const playbackRate = getPitchFromNote(note);
    source.playbackRate.value = playbackRate; // Cambia il pitch
    source.connect(audioContext.destination);
    source.start();

    // Salva la sorgente corrente per permettere lo stop
    currentSource = source;
}

// Funzione per fermare l'audio corrente
function stopAudio() {
    if (currentSource) {
        currentSource.stop(); // Ferma la riproduzione
        currentSource = null; // Reset della sorgente
    }
}

// Gestione del caricamento file
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadAudio(file);
    }
});

// Gestione del bottone play
document.getElementById('playButton').addEventListener('click', () => {
    const noteSelect = document.getElementById('noteSelect');
    const selectedNote = noteSelect.value;
    playAudio(selectedNote);
});

// Gestione del bottone stop
document.getElementById('stopButton').addEventListener('click', () => {
    stopAudio(); // Ferma l'audio corrente
});
