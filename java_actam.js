let currentOctave = 3; // Ottava corrente, parte da C3-F4
let currentSet = 1; // Set di timbri corrente

// Definisci i nomi dei timbri per i 4 set
const soundSets = {
    1: 'keyboard/timbro1',
    2: 'keyboard/timbro2',
    3: 'keyboard/timbro3',
    4: 'keyboard/timbro4'
};

const keyMapOctave1 = {
    'A': 'C3',      // Do
    'W': 'Csharp3', // Do diesis
    'S': 'D3',      // Re
    'E': 'Dsharp3', // Re diesis
    'D': 'E3',      // Mi
    'F': 'F3',      // Fa
    'T': 'Fsharp3', // Fa diesis
    'G': 'G3',      // Sol
    'Y': 'Gsharp3', // Sol diesis
    'H': 'A3',      // La
    'U': 'Asharp3', // La diesis
    'J': 'B3',      // Si
    'K': 'C4',      // Do (ottava superiore)
    'O': 'Csharp4', // Do diesis (ottava superiore)
    'L': 'D4',      // Re (ottava superiore)
    'P': 'Dsharp4', // Re diesis (ottava superiore)
    'Ò': 'E4',      // Mi (ottava superiore)
    'À': 'F4'       // Fa (ottava superiore)
};

const keyMapOctave2 = {
    'A': 'C4',      // Do
    'W': 'Csharp4', // Do diesis
    'S': 'D4',      // Re
    'E': 'Dsharp4', // Re diesis
    'D': 'E4',      // Mi
    'F': 'F4',      // Fa
    'T': 'Fsharp4', // Fa diesis
    'G': 'G4',      // Sol
    'Y': 'Gsharp4', // Sol diesis
    'H': 'A4',      // La
    'U': 'Asharp4', // La diesis
    'J': 'B4',      // Si
    'K': 'C5',      // Do (ottava superiore)
    'O': 'Csharp5', // Do diesis (ottava superiore)
    'L': 'D5',      // Re (ottava superiore)
    'P': 'Dsharp5', // Re diesis (ottava superiore)
    'Ò': 'E5',      // Mi (ottava superiore)
    'À': 'F5'       // Fa (ottava superiore)
};



// Inizializzazione Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
document.getElementById('timbre-select').value = currentSet;

let effectNodes = {
    flanger: null,
    delay: null,
    distortion: null,
    chorus: null 
    
};

// Variabili per tenere traccia degli effetti attivi
let activeEffects = {
    flanger: false,
    delay: false,
    distortion: false,
    chorus: false
};

// LED Elements
const flangerLed = document.getElementById('flanger-led');
const delayLed = document.getElementById('delay-led');
const distortionLed = document.getElementById('distortion-led');
const chorusLed = document.getElementById('chorus-led');

// Knobs Elements
const flangerKnob = document.getElementById('knob-flanger');
const delayKnob = document.getElementById('knob-delay');
const distortionKnob = document.getElementById('knob-distortion');
const chorusKnob = document.getElementById('knob-chorus');

// Event listeners per i knobs
flangerKnob.addEventListener('input', () => {
    if (activeEffects.flanger) {
        effectNodes.flanger = createFlanger(flangerKnob.value);
        updateEffectChain();
    }
});

delayKnob.addEventListener('input', () => {
    if (activeEffects.delay) {
        effectNodes.delay = createDelay(delayKnob.value);
        updateEffectChain();
    }
});

distortionKnob.addEventListener('input', () => {
    if (activeEffects.distortion) {
        effectNodes.distortion = createDistortion(distortionKnob.value);
        updateEffectChain();
    }
});

chorusKnob.addEventListener('input', () => {
    if (activeEffects.chorus) {
        effectNodes.chorus = createChorus(chorusKnob.value);
        updateEffectChain();
    }
});

// Oggetto per tracciare i suoni attivi per ogni nota
const activeNotes = {};

// Funzione per riprodurre il suono della nota con effetti e selezione del timbro
function playNote(note) {

    // Attiva l'audioContext se è sospeso, ogni volta che viene chiamato playNote
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    // Costruisce il percorso del file audio in base al set di timbri attuale
    const sound = `${soundSets[currentSet]}/${note}`;  // Prende il timbro selezionato

    // Carica il file audio della nota con il timbro corretto
    const audio = new Audio(`sounds/${sound}.mp3`);
    
    // Crea una sorgente audio nel contesto audio
    const track = audioContext.createMediaElementSource(audio);

    // Applica gli effetti attivi in catena
    applyActiveEffects(track);

    // Memorizza l'oggetto audio attivo per questa nota
    activeNotes[note] = audio;

    // Avvia la riproduzione
    audio.play().catch(error => console.error("Errore nel caricamento dell'audio: ", error));
}


// Funzione per applicare gli effetti attivi in catena
function applyActiveEffects(track) {
    let lastNode = track;

    // Flanger
    if (activeEffects.flanger) {
        if (!effectNodes.flanger) {
            effectNodes.flanger = createFlanger(flangerKnob.value);
        }
        lastNode.connect(effectNodes.flanger);
        lastNode = effectNodes.flanger;
    }

    // Delay
    if (activeEffects.delay) {
        if (!effectNodes.delay) {
            effectNodes.delay = createDelay(delayKnob.value);
        }
        lastNode.connect(effectNodes.delay);
        lastNode = effectNodes.delay;
    }

    // Distortion
    if (activeEffects.distortion) {
        if (!effectNodes.distortion) {
            effectNodes.distortion = createDistortion(distortionKnob.value);
        }
        lastNode.connect(effectNodes.distortion);
        lastNode = effectNodes.distortion;
    }

    // Chorus
    if (activeEffects.chorus) {
        if (!effectNodes.chorus) {
            effectNodes.chorus = createChorus(chorusKnob.value);
        }
        lastNode.connect(effectNodes.chorus);
        lastNode = effectNodes.chorus;
    }

    // Collega l'ultimo nodo alla destinazione finale
    lastNode.connect(audioContext.destination);
}


// Gestione dei pulsanti effetto e LED
document.getElementById('flanger-btn').addEventListener('click', () => {
    toggleEffect('flanger');
});

document.getElementById('delay-btn').addEventListener('click', () => {
    toggleEffect('delay');
});

document.getElementById('distortion-btn').addEventListener('click', () => {
    toggleEffect('distortion');
});

document.getElementById('chorus-btn').addEventListener('click', () => {
    toggleEffect('chorus');
});

// Funzione per attivare o disattivare un effetto
function toggleEffect(effect) {
    activeEffects[effect] = !activeEffects[effect];  // Attiva/disattiva l'effetto
    if (activeEffects[effect]) {
        // Se l'effetto è attivo, crea il nodo per l'effetto
        effectNodes[effect] = createEffectNode(effect);
    } else {
        // Se l'effetto non è attivo, disconnetti il nodo
        if (effectNodes[effect]) {
            effectNodes[effect].disconnect();
            effectNodes[effect] = null; // Resetta il nodo per quell'effetto
        }
    }
    updateLEDs(); // Aggiorna gli LED per riflettere lo stato degli effetti
}

// Funzione per creare un nodo per l'effetto
function createEffectNode(effect) {
    switch (effect) {
        case 'flanger':
            return createFlanger(flangerKnob.value);
        case 'delay':
            return createDelay(delayKnob.value);
        case 'distortion':
            return createDistortion(distortionKnob.value);
        case 'chorus':
            return createChorus(chorusKnob.value);
        default:
            return null;
    }
}

// Funzione per aggiornare gli LED
function updateLEDs() {
    flangerLed.style.backgroundColor = activeEffects.flanger ? 'green' : 'red';
    delayLed.style.backgroundColor = activeEffects.delay ? 'green' : 'red';
    distortionLed.style.backgroundColor = activeEffects.distortion ? 'green' : 'red';
    chorusLed.style.backgroundColor = activeEffects.chorus ? 'green' : 'red';
}


// Aggiorna lo stato dei LED in base agli effetti attivi
function updateLEDs() {
    flangerLed.classList.toggle('active', activeEffects.flanger);
    delayLed.classList.toggle('active', activeEffects.delay);
    distortionLed.classList.toggle('active', activeEffects.distortion);
    chorusLed.classList.toggle('active', activeEffects.chorus); 
}

// Funzioni per creare gli effetti con i knobs

function createFlanger(rate) {
    const delay = audioContext.createDelay();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    delay.delayTime.value = 0.005;
    osc.frequency.value = rate;  // Usa il valore del knob
    gain.gain.value = 0.002;

    osc.connect(gain);
    gain.connect(delay.delayTime);
    osc.start();

    return delay;
}

function createDelay(time) {
    const delay = audioContext.createDelay();
    delay.delayTime.value = time;  // Usa il valore del knob

    const feedback = audioContext.createGain();
    feedback.gain.value = 0.5;

    delay.connect(feedback);
    feedback.connect(delay);

    return delay;
}

function createDistortion(amount) {
    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(amount);  // Usa il valore del knob
    distortion.oversample = '4x';
    return distortion;
}

function makeDistortionCurve(amount) {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        // Diminuisce il fattore di moltiplicazione per un effetto di distorsione meno aggressivo
        curve[i] = ((3 + (amount * 0.5)) * x * 20 * deg) / (Math.PI + (amount * 0.5) * Math.abs(x));
    }
    return curve;
}

// Funzione per creare il Chorus
function createChorus(depth) {
    const delay = audioContext.createDelay();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    // Imposta un leggero ritardo per simulare il chorus
    delay.delayTime.value = 0.04;  // Tempo di ritardo fisso

    // Oscillatore a bassa frequenza (LFO) per modulare il delay time
    lfo.frequency.value = 0.6;  // Frequenza del chorus
    lfoGain.gain.value = depth * 0.003;  // Profondità della modulazione (usando il valore del knob)

    // Collegamento del LFO al delay per modulare il tempo di ritardo
    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);  // Modula il delay time

    // Inizia l'oscillatore
    lfo.start();

    return delay;  // Restituisce il nodo di delay
}


// ----------------------- Pianola: Ascolto eventi -----------------------------

// Inizialmente settiamo la keyMap alla prima ottava
let keyMap = keyMapOctave1;
let pressedKeys = {};
let keyPressTimes = {};
let mousePressTimes = {};
let activeNotesRects = {};

updateKeyLabels();

// Funzione per cambiare ottava
document.getElementById('switch-octave').addEventListener('click', () => {
    pressedKeys = {}; // Reimposta stato tasti
    if (currentOctave === 3) {
        keyMap = keyMapOctave2; // Passa alla seconda ottava
        currentOctave = 4;
    } else {
        keyMap = keyMapOctave1; // Torna alla prima ottava
        currentOctave = 3;
    }
    updateKeyLabels(); // Aggiorna le etichette delle note sulla tastiera
});


function updateKeyLabels() {
    document.querySelectorAll('.tasto, .tasto-nero').forEach((key) => {
        const dataKey = key.getAttribute('data-key').toUpperCase();
        const note = keyMap[dataKey];
        
        if (note) {
            key.setAttribute('data-note', note);

            // Mostra la nota solo sui tasti bianchi
            if (key.classList.contains('tasto')) {
                key.textContent = note;
            } else {
                key.textContent = ''; // Lascia vuoti i tasti neri
            }
        } else {
            // Rimuove il contenuto se il tasto non è mappato per questa ottava
            key.removeAttribute('data-note');
            key.textContent = '';
        }
    });
}




// Funzione per fermare il suono della nota
function stopNote(note) {
    if (activeNotes[note]) {
        activeNotes[note].pause();  // Pausa immediata
        activeNotes[note].currentTime = 0;  // Riporta l'audio all'inizio
        delete activeNotes[note];  // Rimuove il riferimento alla nota attiva
    }
}


// Aggiungi ascoltatori per la pressione e rilascio dei tasti
document.addEventListener('keydown', function(event) {
    const dataKey = event.key.toUpperCase();
    const note = keyMap[dataKey];

    if (note && !pressedKeys[dataKey]) {
        playNote(note);
        highlightKey(note);
        pressedKeys[dataKey] = true;
        keyPressTimes[dataKey] = performance.now();

        // Imposta la posizione iniziale del rettangolo basata su currentXPosition
        activeNotesRects[dataKey] = {
            note,
            startTime: performance.now(),
            initialPosition: metronomePlaying ? timeBarX : currentXPosition
        };
        updateGrowingNoteRect(dataKey);
    }
});

document.addEventListener('keyup', function(event) {
    const dataKey = event.key.toUpperCase();
    const note = keyMap[dataKey];

    if (note) {
        unhighlightKey(note);
        stopNote(note);
        pressedKeys[dataKey] = false;

        // Completa il rettangolo e lo disegna
        const pressDuration = performance.now() - keyPressTimes[dataKey];
        drawFinalNoteOnStaff(note, pressDuration);
        delete activeNotesRects[dataKey];
    }
});

// Aggiungi ascoltatori per il clic sui tasti della pianola
const keys = document.querySelectorAll('.tasto, .tasto-nero'); // Seleziona sia i tasti bianchi che neri

keys.forEach(key => {
    key.addEventListener('mousedown', function(event) {
        event.stopPropagation(); // Evita che il clic passi al canvas
        const note = this.getAttribute('data-note');

        if (note && !pressedKeys[note]) {
            playNote(note);
            highlightKey(note);
            pressedKeys[note] = true;
            mousePressTimes[note] = performance.now();

            // Avvia il rettangolo in crescita
            activeNotesRects[note] = {
                note,
                startTime: performance.now(),
                initialPosition: metronomePlaying ? timeBarX : currentXPosition
            };
            updateGrowingNoteRect(note);  // Aggiorna il rettangolo in tempo reale
        }
    });

    key.addEventListener('mouseup', function() {
        const note = this.getAttribute('data-note');

        if (note) {
            unhighlightKey(note);
            stopNote(note);
            pressedKeys[note] = false;

            // Calcola la durata della pressione e disegna il rettangolo finale
            const pressDuration = performance.now() - mousePressTimes[note];
            drawFinalNoteOnStaff(note, pressDuration);
            delete activeNotesRects[note];
        }
    });

    key.addEventListener('mouseleave', function() {
        const note = this.getAttribute('data-note');

        if (note && pressedKeys[note]) {
            unhighlightKey(note);
            stopNote(note);
            pressedKeys[note] = false;

            // Disegna il rettangolo finale se il mouse esce dal tasto
            const pressDuration = performance.now() - mousePressTimes[note];
            drawFinalNoteOnStaff(note, pressDuration);
            delete activeNotesRects[note];
        }
    });
});




function highlightKey(note) {
    const tasto = document.querySelector(`[data-note="${note}"]`);
    if (tasto) {
        tasto.classList.add('active');
        
        // Visualizza "#" invece di "sharp" sui tasti neri durante la pressione
        if (tasto.classList.contains('tasto-nero')) {
            const noteLabel = note.replace("sharp", "#"); // Sostituisce "sharp" con "#"
            tasto.textContent = noteLabel;
        }
    }
}


function unhighlightKey(note) {
    const tasto = document.querySelector(`[data-note="${note}"]`);
    if (tasto) {
        tasto.classList.remove('active');
        
        // Rimuove il testo dai tasti neri al rilascio
        if (tasto.classList.contains('tasto-nero')) {
            tasto.textContent = '';
        }
    }
}




// SELECTOR
document.getElementById('timbre-select').addEventListener('change', function() {
    currentSet = parseInt(this.value);  // Aggiorna il set corrente

    // Resetta l'ottava alla terza
    keyMap = keyMapOctave1;  // Imposta la mappa delle note alla prima ottava
    currentOctave = 3;       // Imposta l'ottava corrente a 3
    updateKeyLabels();       // Aggiorna le etichette delle note sulla tastiera
});




// ----------------------- PAD -----------------------------

// Mappa per tenere traccia dello stato dei tasti del pad premuti
let pressedPads = {};

// Seleziona tutti i tasti del pad
const pads = document.querySelectorAll('.pad');

// Aggiungi evento click ai tasti del pad
pads.forEach(pad => {
    pad.addEventListener('mousedown', () => {
        const key = pad.getAttribute('data-key');
        if (!pressedPads[key]) {
            playPadSound(pad);
            pad.classList.add('key-active');  // Aggiunge l'effetto visivo
            pad.classList.add('active-text');  // Aggiunge classe per cambiare il colore del testo
            pressedPads[key] = true; // Segna il tasto del pad come premuto
        }
    });

    pad.addEventListener('mouseup', () => {
        const key = pad.getAttribute('data-key');
        pad.classList.remove('key-active');  // Rimuove l'effetto visivo
        pad.classList.remove('active-text');  // Rimuove classe per il colore del testo
        pressedPads[key] = false; // Segna il tasto del pad come rilasciato
    });

    pad.addEventListener('mouseleave', () => {
        const key = pad.getAttribute('data-key');
        pad.classList.remove('key-active');  // Rimuove l'effetto visivo
        pad.classList.remove('active-text');  // Rimuove classe per il colore del testo
        pressedPads[key] = false; // Segna il tasto del pad come rilasciato
    });
});

// Ascolta per la pressione dei tasti numerici
document.addEventListener('keydown', (e) => {
    const key = e.keyCode;
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad && !pressedPads[key]) {
        playPadSound(pad);
        pad.classList.add('key-active');  // Aggiunge l'effetto visivo
        pad.classList.add('active-text');  // Aggiunge classe per cambiare il colore del testo
        pressedPads[key] = true; // Segna il tasto del pad come premuto
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.keyCode;
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
        pad.classList.remove('key-active');  // Rimuove l'effetto visivo
        pad.classList.remove('active-text');  // Rimuove classe per il colore del testo
        pressedPads[key] = false; // Segna il tasto del pad come rilasciato
    }
});

// Funzione per riprodurre i suoni del pad
function playPadSound(pad) {
    const sound = pad.getAttribute('data-sound');
    const audio = new Audio(`sounds/pad/${sound}.mp3`);
    audio.play().catch(error => console.error("Errore nel caricamento dell'audio: ", error));
}



// ----------------------- Pentagramma e Barra del Tempo -----------------------------

const canvas = document.getElementById('staffCanvas');
const ctx = canvas.getContext('2d');
let currentXPosition = 0;
let timeBarX = 0;
let isPlaying = false;
let timeBarIntervalId;  // Identificatore per la barra del tempo
let metronomeIntervalId;  // Identificatore per il metronomo
let bpm = 120;  // Default BPM
let beatDuration = 60000 / bpm;  // Durata di un battito in millisecondi
let numberOfBars = 4;  // Default battute
let beatsPerBar = 4;  // Numero di battiti per battuta, con let è modificabile 
let barWidth = 200;  // Larghezza per ogni battuta
let staffLength = numberOfBars * barWidth;  // Lunghezza totale del pentagramma
let beatCount = 0;  // Contatore per i battiti
let isTimeBarActive = false;  // Variabile per tracciare lo stato della barra del tempo
const metronomeAccentFrequency = 800;  // Frequenza per l'accento del metronomo
const metronomeClickFrequency = 500;  // Frequenza per il click normale
let metronomeMuted = false;  // Stato di mute per il metronomo
let metronomePlaying = false;

// Imposta la larghezza del canvas basata sul numero di battute
canvas.width = staffLength;

// Input per il BPM
const bpmInput = document.getElementById('bpm');
bpmInput.addEventListener('input', function() {
    bpm = parseInt(this.value);
    beatDuration = 60000 / bpm;  // Aggiorna la durata del battito
    if (metronomePlaying) {
        clearInterval(metronomeIntervalId);  // Ferma l'intervallo precedente
        startMetronome();  // Riavvia il metronomo con il nuovo BPM
    }
});

// Input per il numero di battute
const barsInput = document.getElementById('bars');  // Presuppone un input HTML con id 'bars'
barsInput.addEventListener('input', function() {
    numberOfBars = parseInt(this.value);
    staffLength = numberOfBars * barWidth;  // Ricalcola la lunghezza totale del pentagramma
    canvas.width = staffLength;  // Aggiorna la larghezza del canvas
    currentXPosition = 0;  // Reset posizione corrente delle note
    timeBarX = 0;  // Reset della posizione della barra
});



let playedNotes = [];  // Array per memorizzare le note già suonate
let performanceStartTime = performance.now();  // Momento in cui la performance inizia
let lastNoteTime = performanceStartTime;  // Tempo dell'ultima nota suonata
let totalBeats = numberOfBars * beatsPerBar;  // Numero totale di battiti
const barWidthPerBeat = canvas.width / totalBeats; // Quantità di pixel di spostamento per ogni battito
//let canvasWidthPerBeat = canvas.width / totalBeats;  // Spazio che ogni battito deve occupare nel canvas
const toleranceWindow = barWidthPerBeat * 0.2;  // Finestra di tolleranza per allineare la nota alla barra

// Mappa dei colori per le note

const noteColors = {
    "C3": "#FF5733", "Csharp3": "#C70039", "D3": "#900C3F", "Dsharp3": "#581845", "E3": "#FF33FF",
    "F3": "#33FF57", "Fsharp3": "#33FFF3", "G3": "#33AFFF", "Gsharp3": "#5733FF", "A3": "#FF335E",
    "Asharp3": "#FF9133", "B3": "#33FF8E", "C4": "#A633FF", "Csharp4": "#D433FF", "D4": "#FF33D4",
    "Dsharp4": "#FF33A6", "E4": "#FF3384", "F4": "#FF3367", "Fsharp4": "#FF3350", "G4": "#FF5733",
    "Gsharp4": "#FF6F33", "A4": "#FF8C33", "Asharp4": "#FFB833", "B4": "#FFDA33", "C5": "#FFE733",
    "Csharp5": "#D4FF33", "D5": "#A6FF33", "Dsharp5": "#84FF33", "E5": "#67FF33", "F5": "#50FF33"
};


// Funzione per ottenere la posizione verticale della nota (aggiornata per due ottave)

function getYPositionForNote(note) {

    const positions = {
        "C3": 378, "Csharp3": 365, "D3": 352, "Dsharp3": 339, "E3": 326,
        "F3": 313, "Fsharp3": 300, "G3": 287, "Gsharp3": 274, "A3": 261,
        "Asharp3": 248, "B3": 235, "C4": 222, "Csharp4": 209, "D4": 196,
        "Dsharp4": 183, "E4": 170, "F4": 157, "Fsharp4": 144, "G4": 131,
        "Gsharp4": 118, "A4": 105, "Asharp4": 92, "B4": 79, "C5": 66,
        "Csharp5": 53, "D5": 40, "Dsharp5": 27, "E5": 14, "F5": 1
    };

    return positions[note];

}



// Funzione per disegnare rettangoli delle note e mantenerli fermi

function updateGrowingNoteRect(dataKey) {
    if (!pressedKeys[dataKey] || !activeNotesRects[dataKey]) return;

    const rectData = activeNotesRects[dataKey];
    const duration = performance.now() - rectData.startTime;

    // Sincronizza la posizione iniziale con il metronomo o corrente se non attivo
    const xPosition = rectData.initialPosition + ((duration / 1000) * barWidthPerBeat * 0.35 * 2.8);

    drawGrowingNoteOnStaff(rectData.note, xPosition, duration);

    requestAnimationFrame(() => updateGrowingNoteRect(dataKey));
}

// Disegna rettangolo in crescita
function drawGrowingNoteOnStaff(note, xPosition, duration) {
    let yPosition = getYPositionForNote(note);
    let rectHeight = 10;
    let rectWidth = (duration / 1000) * barWidthPerBeat * 0.35 * 2.8;

    if (xPosition + rectWidth > canvas.width) {
        let remainingWidth = canvas.width - xPosition;
        ctx.fillStyle = noteColors[note] || "black";
        ctx.fillRect(xPosition, yPosition, remainingWidth, rectHeight);

        let remainingRectWidth = rectWidth - remainingWidth;
        ctx.fillRect(0, yPosition, remainingRectWidth, rectHeight);
    } else {
        ctx.fillStyle = noteColors[note] || "black";
        ctx.fillRect(xPosition, yPosition, rectWidth, rectHeight);
    }
}


// Funzione per disegnare il rettangolo finale della nota
function drawFinalNoteOnStaff(note, duration) {
    let yPosition = getYPositionForNote(note);  // Posizione Y della nota
    let rectHeight = 10;  // Altezza del rettangolo
    
    // Calcola la larghezza in modo indipendente dal metronomo (solo in base alla durata)
    let rectWidth = (duration / 1000) * barWidthPerBeat * 0.35 * 2.8;  // Larghezza del rettangolo

    // Determina la posizione X: con o senza metronomo
    let xPosition = metronomePlaying 
        ? timeBarX  // Se il metronomo è attivo, usa la posizione della barra del metronomo
        : currentXPosition;  // Se il metronomo è spento, usa la posizione corrente

    // Gestisci il disegno del rettangolo finale in base alla larghezza del canvas
    if (xPosition + rectWidth > canvas.width) {
        let remainingWidth = canvas.width - xPosition;
        ctx.fillStyle = noteColors[note] || "black";
        ctx.fillRect(xPosition, yPosition, remainingWidth, rectHeight);  // Disegna la prima parte

        let remainingRectWidth = rectWidth - remainingWidth;
        ctx.fillRect(0, yPosition, remainingRectWidth, rectHeight);  // Disegna la seconda parte
    } else {
        ctx.fillStyle = noteColors[note] || "black";
        ctx.fillRect(xPosition, yPosition, rectWidth, rectHeight);  // Disegna il rettangolo completo
    }

    // **Sostituzione "sharp" con "#"**: ora funziona sempre, indipendentemente dallo stato del metronomo
    let displayNote = note.includes("sharp") ? note.replace("sharp", "#") : note;

    // Visualizzazione del nome della nota (con il simbolo # corretto per "sharp")
    ctx.fillStyle = "black";  // Imposta il colore del testo
    ctx.font = "12px Arial";  // Imposta il font
    ctx.fillText(displayNote, xPosition + rectWidth*2 + 3, yPosition + rectHeight / 2);

    // Aggiungi la nota al pentagramma con la posizione e dimensione
    playedNotes.push({
        note, 
        x: xPosition- rectWidth,  // Posizione X aggiornata
        y: yPosition, 
        width: rectWidth,  // Larghezza costante
        height: rectHeight, 
        color: noteColors[note] || "black",  // Imposta il colore della nota, con valore di fallback "black"
        wasMetronomePlaying: metronomePlaying
    });

    // Se il metronomo non è attivo, aggiorna la posizione corrente
    if (!metronomePlaying) {
        currentXPosition += rectWidth + 8; // Incrementa la posizione per la prossima nota
    }

    // Se la posizione corrente supera il canvas, resettala
    if (currentXPosition > canvas.width) {
        currentXPosition = 0;
    }
}


// Funzione per ridisegnare tutte le note già suonate
function redrawNotes() {
    playedNotes.forEach(note => {
        // Imposta la posizione X basata sullo stato del metronomo quando la nota è stata disegnata
        let xPosition = note.wasMetronomePlaying 
            ? timeBarX  // Usa la posizione del metronomo se attivo quando è stata disegnata
            : note.x;   // Altrimenti, mantieni la posizione originale

        // Imposta la larghezza originale della nota
        let rectWidth = note.width;
        if(xPosition==note.x)
             {
                rectWidth=rectWidth*2  ;
                xPosition= note.x + rectWidth -19.6;
               

            }
        else{xPosition=note.x ;}

        // Usa la posizione e larghezza corrette per disegnare
        ctx.fillStyle = note.color;
        ctx.fillRect(xPosition, note.y, rectWidth, note.height);

        // **Sostituzione "sharp" con "#"**
        let displayNote = note.note.includes("sharp") ? note.note.replace("sharp", "#") : note.note;

        // Visualizza il nome della nota
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(displayNote, xPosition + rectWidth + 5, note.y + note.height / 2);
    });
    
}





// Funzione per pulire il pentagramma ma non cancellare le note
function clearStaff() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawNotes();  // Ridisegna tutte le note già suonate
    drawReferenceBars();  // Ridisegna le barre di riferimento statiche

}



// Funzione per cancellare tutte le note dal canvas
function clearAllNotes() {

    playedNotes = [];  // Svuota l'array delle note suonate
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Pulisce il canvas
    drawReferenceBars();  // Ridisegna le barre di riferimento statiche

}

document.getElementById('clearNotesButton').addEventListener('click', clearAllNotes);


// Funzione per disegnare le barre di riferimento verticali grigie
function drawReferenceBars() {

    // Calcola la larghezza di ciascun quarto (beat) nel canvas
    const beatWidth = canvas.width / (numberOfBars * beatsPerBar);
    ctx.strokeStyle = "gray"; // Imposta il colore grigio per le barre

    // Ciclo per disegnare le barre di riferimento
    for (let i = 0; i < numberOfBars * beatsPerBar; i++) {
        const xPosition = i * beatWidth;
        // Aumenta la larghezza della prima barra di ogni battuta (accentata)
        ctx.lineWidth = (i % beatsPerBar === 0) ? 3 : 1;

        // Disegna la linea verticale
        ctx.beginPath();
        ctx.moveTo(xPosition, 0);
        ctx.lineTo(xPosition, canvas.height);
        ctx.stroke();

    }

}

drawReferenceBars();  // Ridisegna all'inizio le barre di riferimento statiche



// Quando cambia il numero di battute

barsInput.addEventListener('input', function() {

    numberOfBars = parseInt(this.value);
    staffLength = numberOfBars * barWidth;  // Ricalcola la lunghezza totale del pentagramma
    canvas.width = staffLength;  // Aggiorna la larghezza del canvas
    clearStaff();  // Pulisce il pentagramma
    drawReferenceBars();  // Disegna le barre di riferimento

});



// -------------------- Controllo Barra del Tempo --------------------
// Funzione per disegnare la barra del tempo

function drawTimeBar() {

    ctx.lineWidth = 4;  // Imposta la larghezza della linea
    ctx.beginPath();

    // Calcoliamo una posizione orizzontale arrotondata per evitare differenze di spessore
    const roundedX = Math.round(timeBarX);
    ctx.moveTo(roundedX, 0);  // Inizia la linea in alto
    // Verifica se il metronomo è attivo
   if (beatCount % beatsPerBar === 0) {  // Se è un battito accentuato
        ctx.strokeStyle = "green";  // Barra verde per il primo battito
    } else {
        ctx.strokeStyle = "red";  // Barra rossa per i battiti normali
    }

    ctx.lineTo(roundedX, canvas.height);  // Disegna la linea fino in basso
    ctx.stroke();  // Esegui il disegno
}


function startTimeBar() {

    if (!isTimeBarActive) {  // Cambiato per controllare solo l'attivazione della barra

        isTimeBarActive = true;
        //elapsedTime = 0;  // Reset del tempo accumulato per gli scatti
        timeBarX = 0;
        beatCount = 0;  // Resetta il conteggio dei battiti
        requestAnimationFrame(animateTimeBar);  // Inizia l'animazione della barra del tempo

    }

}

// Funzione per fermare la barra del tempo

function stopTimeBar() {
    isTimeBarActive = false;  // Ferma la barra
    //cancelAnimationFrame(animateTimeBar);  // Ferma l'animazione
}

// Funzione per animare la barra del tempo
function animateTimeBar() {
    if (!isTimeBarActive) return;  // Esci se la barra del tempo non è attiva

    clearStaff();  // Pulisce il pentagramma
    drawTimeBar();  // Ridisegna la barra del tempo

    // Calcolo del tempo reale
    const currentTime = performance.now();
    const elapsedTime = currentTime - performanceStartTime; //- beatDuration;  // Aggiungi un beat di offset;  // Tempo trascorso dall'inizio della performance

    // Durata totale di una battuta (in millisecondi)
    const barDuration = beatDuration * beatsPerBar;

    // Calcola la posizione attuale all'interno della battuta corrente
    const progressInBar = (elapsedTime % barDuration) / barDuration;

    // Calcola `timeBarX` come frazione della larghezza della battuta
    timeBarX = progressInBar * barWidth;

    // Allinea la posizione della barra alla posizione del metronomo usando `beatCount`
    const barsElapsed = Math.floor(elapsedTime / barDuration);
    timeBarX += barsElapsed * barWidth;

    // Verifica se `timeBarX` ha superato la larghezza del canvas e, in tal caso, resetta
    if (timeBarX >= canvas.width) {
        timeBarX = 0;  // Torna all'inizio se si supera la larghezza del canvas
        performanceStartTime = performance.now();  // Reset del tempo per sincronizzare
        //beatCount = 0;  // Resetta il conteggio dei battiti per sincronizzare
    }

    requestAnimationFrame(animateTimeBar);  // Continua l'animazione
}

// -------------------- Controllo Barra del Tempo e Metronomo Sincronizzati --------------------

const startMetronomeButton = document.getElementById('startMetronomeButton');
const stopMetronomeButton = document.getElementById('stopMetronomeButton');
const muteMetronomeButton = document.getElementById('muteMetronomeButton');  // Bottone per mutare il metronomo

startMetronomeButton.addEventListener('click', startMetronome);
stopMetronomeButton.addEventListener('click', stopMetronome);
muteMetronomeButton.addEventListener('click', toggleMetronomeMute);  // Evento per il bottone mute



// Funzione per attivare/disattivare il mute del metronomo

function toggleMetronomeMute() {
    metronomeMuted = !metronomeMuted;
    muteMetronomeButton.innerText = metronomeMuted ? "Unmute Metronome" : "Mute Metronome";  // Cambia il testo del bottone
}

function startMetronome() {
    if (!metronomePlaying) {
        metronomePlaying = true;
        beatCount = 0;  // Resetta il conteggio dei battiti all'inizio
        timeBarX = 0;   // Reset della posizione della barra del tempo
        performanceStartTime = performance.now();  // Reset del tempo di inizio per sincronizzare


        // Disegna la barra al punto zero immediatamente
        clearStaff();
        drawTimeBar();  // Barra iniziale a 0

        // Suona subito il primo colpo accentato
        playMetronomeAccent();

        // Avvia il metronomo e la barra sincronizzati
        metronomeIntervalId = setInterval(() => {

            beatCount = (beatCount + 1) % (beatsPerBar * numberOfBars);
            
            // Suona il click del metronomo
            if (beatCount % beatsPerBar === 0) {
                playMetronomeAccent();  // Primo battito accentato
                //timeBarX = 0;  // Reset della barra esattamente sul primo colpo
            } else {
                playMetronomeClick();  // Battiti normali
            }


        }, beatDuration); // Imposta l'intervallo basato sulla durata di un battito


        // Avvia anche la barra del tempo
        startTimeBar();
    }
}


function stopMetronome() {
    clearInterval(metronomeIntervalId);
    metronomePlaying = false;
    stopTimeBar();  // Ferma la barra del tempo
}

// Funzione per il click normale del metronomo
function playMetronomeClick() {

    if (metronomeMuted) return;  // Esce subito se il metronomo è mutato

    const oscillator = audioContext.createOscillator();  // Crea un oscillatore
    const gainNode = audioContext.createGain();  // Crea un nodo per controllare il volume

    oscillator.type = 'square';  // Tipo di onda
    oscillator.frequency.setValueAtTime(metronomeClickFrequency, audioContext.currentTime);  // Frequenza del click (500 Hz)

    gainNode.gain.setValueAtTime(1, audioContext.currentTime);  // Volume iniziale
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);  // Calo rapido del volume

    oscillator.connect(gainNode);  // Collega l'oscillatore al gain
    gainNode.connect(audioContext.destination);  // Collega il gain al contesto audio (output)

    oscillator.start();  // Avvia l'oscillatore
    oscillator.stop(audioContext.currentTime + 0.1);  // Ferma l'oscillatore dopo 100ms (breve click)
}

// Funzione per il click accentato (primo battito)
function playMetronomeAccent() {

    if (metronomeMuted) return;  // Esce subito se il metronomo è mutato

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';  // Tipo di onda
    oscillator.frequency.setValueAtTime(metronomeAccentFrequency, audioContext.currentTime);  // Frequenza più alta per l'accento

    gainNode.gain.setValueAtTime(1, audioContext.currentTime);  // Volume iniziale
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);  // Rapido calo del volume

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);  // Suono breve
}


//TIME SIGNATURE

const timeSignatureSelect = document.getElementById('timeSignature');

timeSignatureSelect.addEventListener('change', function() {
    const [beats, noteValue] = this.value.split('/').map(Number);

    // Aggiorna beatsPerBar in base al ritmo selezionato
    beatsPerBar = beats;

    // Regola beatDuration a seconda che il ritmo sia in quarti o ottavi
    beatDuration = (60000 / bpm) * (4 / noteValue);

    // Aggiorna la lunghezza dello spartito
    staffLength = numberOfBars * barWidth;
    canvas.width = staffLength;

    // Pulisce e ridisegna il canvas con la nuova configurazione del ritmo
    clearStaff();
    drawReferenceBars();

    // Riavvia il metronomo se è già in esecuzione
    if (metronomePlaying) {
        stopMetronome();
        startMetronome();
    }

    // Rimuovi il focus dal select dopo la selezione
    this.blur();
});
