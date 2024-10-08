/*VELOCITà non costante ma no distorsione
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
*/

/*
VELOCITà COSTANTE PERò CON UN PO' DI DISTORSIONE
*/
// Variabile globale per la sorgente audio 
let currentSource = null;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let streamDestination;

// Funzione per avviare il contesto audio
async function startAudioContext() {
    if (Tone.context.state === 'suspended') {
        await Tone.start();
        console.log('AudioContext avviato.');
    }
}

// Funzione per caricare e decodificare il file MP3
async function loadAudio(file) {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

// Funzione per ottenere il valore di pitch dalla nota
function getPitchFromNote(note) {
    const notes = {
        "C": 0,   // Do (C)
        "C#": 1,  // Do diesis (C#)
        "D": 2,   // Re (D)
        "D#": 3,  // Re diesis (D#)
        "E": 4,   // Mi (E)
        "F": 5,   // Fa (F)
        "F#": 6,  // Fa diesis (F#)
        "G": 7,   // Sol (G)
        "G#": 8,  // Sol diesis (G#)
        "A": 9,   // La (A)
        "A#": 10, // La diesis (A#)
        "B": 11   // Si (B)
    };
    return notes[note] - notes["A"]; // Calcola la differenza rispetto a La (A)
}

// Funzione per riprodurre l'audio con un pitch modificato
async function playAudio(note) {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        console.error("Nessun file audio caricato.");
        return;
    }

    try {
        await startAudioContext();
        const audioBuffer = await loadAudio(fileInput.files[0]);

        if (currentSource) {
            currentSource.stop();
        }

        const source = new Tone.BufferSource(audioBuffer, () => {
            console.log("Buffer audio pronto.");
        });

        const pitchShift = new Tone.PitchShift({
            pitch: getPitchFromNote(note),
            windowSize: 0.2,
            feedback: 0.0,
            wet: 1
        });

        const gainNode = new Tone.Gain(0.8);
        streamDestination = Tone.context.createMediaStreamDestination();

        source.connect(pitchShift);
        pitchShift.connect(gainNode);
        gainNode.connect(streamDestination);
        gainNode.toDestination();

        source.start();
        currentSource = source;

    } catch (error) {
        console.error("Errore durante la riproduzione dell'audio:", error);
    }
}

// Funzione per fermare l'audio corrente
function stopAudio() {
    if (currentSource) {
        currentSource.stop();
        currentSource = null;
    }
}

// Funzione per gestire la registrazione audio
function startRecording() {
    try {
        if (!streamDestination) {
            console.error("streamDestination non è stato inizializzato.");
            return;
        }

        mediaRecorder = new MediaRecorder(streamDestination.stream);
        mediaRecorder.ondataavailable = (event) => {
            console.log("Data available:", event.data.size);
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'registrazione_effettuata.webm';
            a.click();
            recordedChunks = [];
        };

        mediaRecorder.onerror = (event) => {
            console.error("Errore nella registrazione:", event.error);
        };

        mediaRecorder.start();
        isRecording = true;
        updateRecordingIndicator(true);
    } catch (error) {
        console.error("Errore nella registrazione: ", error);
    }
}

// Funzione per fermare la registrazione audio
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        updateRecordingIndicator(false);
    }
}

// Gestione del caricamento file
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadAudio(file)
            .then(() => console.log("File audio caricato con successo."))
            .catch(error => console.error("Errore nel caricamento del file audio:", error));
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

// Gestione del bottone registra
document.getElementById('recordButton').addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

// Funzione per aggiornare l'indicatore di registrazione
function updateRecordingIndicator(isRecording) {
    const indicator = document.getElementById('recording-indicator');
    if (indicator) {
        indicator.style.backgroundColor = isRecording ? 'red' : 'green';
        indicator.textContent = isRecording ? 'Registrazione in corso...' : 'Registrazione ferma';
    }
}
