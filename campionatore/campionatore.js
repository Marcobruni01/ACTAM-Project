// Crea un contesto audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer;

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
    
    // Calcola il pitch in base alla nota e al Do centrale (C4)
    const baseNote = notes["C"]; // Do centrale
    return baseNote / notes[note]; // Calcola il valore di playbackRate
}

// Funzione per riprodurre l'audio con un pitch modificato
function playAudio(note) {
    if (!audioBuffer) {
        console.error("Audio buffer non caricato.");
        return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    const playbackRate = getPitchFromNote(note);
    source.playbackRate.value = playbackRate; // Cambia il pitch
    source.connect(audioContext.destination);
    source.start();
}

// Esempio di utilizzo
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadAudio(file);
    }
});

document.getElementById('playButton').addEventListener('click', () => {
    const noteSelect = document.getElementById('noteSelect');
    const selectedNote = noteSelect.value;
    playAudio(selectedNote);
});
