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
    'A': 'C3',
    'W': 'C#3',
    'S': 'D3',
    'E': 'D#3',
    'D': 'E3',
    'F': 'F3',
    'T': 'F#3',
    'G': 'G3',
    'Y': 'G#3',
    'H': 'A3',
    'U': 'A#3',
    'J': 'B3',
    'K': 'C4',
    'O': 'C#4',
    'L': 'D4',
    'P': 'D#4',
    'Ò': 'E4',
    'À': 'F4'
};

const keyMapOctave2 = {
    'A': 'C4',
    'W': 'C#4',
    'S': 'D4',
    'E': 'D#4',
    'D': 'E4',
    'F': 'F4',
    'T': 'F#4',
    'G': 'G4',
    'Y': 'G#4',
    'H': 'A4',
    'U': 'A#4',
    'J': 'B4',
    'K': 'C5',
    'O': 'C#5',
    'L': 'D5',
    'P': 'D#5',
    'Ò': 'E5',
    'À': 'F5'
};

// Inizializzazione Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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


// Funzione per riprodurre il suono della nota con effetti e selezione del timbro
function playNote(note) {
    // Costruisce il percorso del file audio in base al set di timbri attuale
    const sound = `${soundSets[currentSet]}/${note}`;  // Prende il timbro selezionato

    // Carica il file audio della nota con il timbro corretto
    const audio = new Audio(`sounds/${sound}.mp3`);
    
    // Crea una sorgente audio nel contesto audio
    const track = audioContext.createMediaElementSource(audio);

    // Applica gli effetti attivi in catena
    applyActiveEffects(track);

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
    updateLEDs();
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

updateKeyLabels();

// Funzione per cambiare ottava
document.getElementById('switch-octave').addEventListener('click', () => {
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
    document.querySelectorAll('.tasto').forEach((key) => {
        const note = keyMap[key.getAttribute('data-key').toUpperCase()];
        key.setAttribute('data-note', note);
        key.textContent = note; // Mostra il nome della nota sul tasto
    });
}

// Aggiungi un ascoltatore per la pressione dei tasti della tastiera
document.addEventListener('keydown', function(event) {
    const note = keyMap[event.key.toUpperCase()];
    if (note && !pressedKeys[event.key.toUpperCase()]) {
        playNote(note);
        highlightKey(note);
        pressedKeys[event.key.toUpperCase()] = true;
    }
});

document.addEventListener('keyup', function(event) {
    const note = keyMap[event.key.toUpperCase()];
    if (note) {
        unhighlightKey(note);
        pressedKeys[event.key.toUpperCase()] = false;
    }
});

// Aggiungi un ascoltatore per il clic sui tasti della pianola
const keys = document.querySelectorAll('.tasto');
keys.forEach(key => {
    key.addEventListener('mousedown', function() {
        const note = this.getAttribute('data-note');
        if (!pressedKeys[note]) {
            playNote(note);
            highlightKey(note);
            pressedKeys[note] = true;
        }
    });

    key.addEventListener('mouseup', function() {
        const note = this.getAttribute('data-note');
        unhighlightKey(note);
        pressedKeys[note] = false;
    });

    key.addEventListener('mouseleave', function() {
        const note = this.getAttribute('data-note');
        unhighlightKey(note);
        pressedKeys[note] = false;
    });
});

// Funzione per evidenziare il tasto
function highlightKey(note) {
    const tasto = document.querySelector(`[data-note="${note}"]`);
    if (tasto) {
        tasto.classList.add('active');
    }
}

// Funzione per rimuovere l'evidenziazione del tasto
function unhighlightKey(note) {
    const tasto = document.querySelector(`[data-note="${note}"]`);
    if (tasto) {
        tasto.classList.remove('active');
    }
}





//SELECTOR//
// Selettore di timbri
document.getElementById('timbre-select').addEventListener('change', function() {
    currentSet = parseInt(this.value);  // Aggiorna il set corrente
});



// ----------------------- Pad -----------------------------

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
const beatsPerBar = 4;  // Numero di battiti per battuta
let barWidth = 200;  // Larghezza per ogni battuta
let staffLength = numberOfBars * barWidth;  // Lunghezza totale del pentagramma
let beatCount = 0;  // Contatore per i battiti
let isTimeBarActive = false;  // Variabile per tracciare lo stato della barra del tempo
const metronomeAccentFrequency = 800;  // Frequenza per l'accento del metronomo
const metronomeClickFrequency = 500;  // Frequenza per il click normale

// Imposta la larghezza del canvas basata sul numero di battute
canvas.width = staffLength;

// Input per il BPM
const bpmInput = document.getElementById('bpm');
bpmInput.addEventListener('input', function() {
    bpm = parseInt(this.value);
    beatDuration = 60000 / bpm;
    if (isPlaying) {
        stopTimeBar();
        startTimeBar();
    }
});

// Input per il numero di battute
const barsInput = document.getElementById('bars');  // Presuppone un input HTML con id 'bars'
barsInput.addEventListener('input', function() {
    numberOfBars = parseInt(this.value);
    staffLength = numberOfBars * barWidth;  // Ricalcola la lunghezza totale del pentagramma
    canvas.width = staffLength;  // Aggiorna la larghezza del canvas
    currentXPosition = 0;  // Reset posizione corrente delle note
    clearStaff();  // Pulisce il pentagramma
    drawStaffLines();  // Ridisegna le linee del pentagramma
});

// Funzione per disegnare la barra del tempo
function drawTimeBar() {
    ctx.lineWidth = 2;  // Imposta la larghezza della linea
    ctx.beginPath();
    ctx.moveTo(timeBarX, 0);  // Inizia la linea in alto

    // Imposta il colore della barra
    if ((beatCount-1) % beatsPerBar === 0) {  // Se è un battito accentuato
        ctx.strokeStyle = "green";  // Barra verde per il primo battito
    } else {
        ctx.strokeStyle = "red";  // Barra rossa per i battiti normali
    }

    ctx.lineTo(timeBarX, canvas.height);  // Disegna la linea fino in basso
    ctx.stroke();  // Esegui il disegno
}


// Funzione per disegnare la nota sul pentagramma
function drawNoteOnStaff(note) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    let yPosition = getYPositionForNote(note);
    ctx.arc(currentXPosition, yPosition, 5, 0, Math.PI * 2);
    ctx.fill();
    currentXPosition += 40;  // Sposta la posizione per la prossima nota
    if (currentXPosition > staffLength) {
        clearStaff();  // Se superiamo la lunghezza del pentagramma, lo puliamo
        currentXPosition = 0;
    }
}

// Funzione per ottenere la posizione verticale della nota sul pentagramma
function getYPositionForNote(note) {
    const positions = {
        "C": 160, "C#": 150, "D": 140, "D#": 130, "E": 120,
        "F": 110, "F#": 100, "G": 90, "G#": 80, "A": 70,
        "A#": 60, "B": 50, "C2": 40, "C#2": 30, "D2": 20,
        "D#2": 10, "E2": 0, "F2": -10
    };
    return positions[note];
}

// Funzione per pulire il pentagramma
function clearStaff() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Funzione per disegnare le linee del pentagramma
function drawStaffLines() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 40 + i * 30);
        ctx.lineTo(canvas.width, 40 + i * 30);
        ctx.stroke();
    }
}

drawStaffLines();  // Disegniamo inizialmente le linee del pentagramma

// -------------------- Controllo Barra del Tempo --------------------
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

startButton.addEventListener('click', startTimeBar);
stopButton.addEventListener('click', stopTimeBar);

function startTimeBar() {
    if (!isPlaying) {
        isPlaying = true;
        isTimeBarActive = true;  // Attiva la barra del tempo
        timeBarX = 0;
        beatCount = 0;  // Resetta il conteggio dei battiti
        animateTimeBar();  // Avvia l'animazione
    }
}

function stopTimeBar() {
    isPlaying = false;
    isTimeBarActive = false;  // Disattiva la barra del tempo
    timeBarX = 0;  // Reset della posizione della barra del tempo quando viene fermata
    clearStaff();  // Pulisce il pentagramma
    drawStaffLines();  // Ridisegna il pentagramma
    drawTimeBar();  // Ridisegna la barra del tempo in posizione 0
}

// Funzione per animare la barra del tempo
function animateTimeBar() {
    if (!isTimeBarActive) return;  // Esci se la barra del tempo non è attiva
    
    clearStaff();  // Pulisce il pentagramma
    drawStaffLines();  // Ridisegna le linee del pentagramma
    drawTimeBar();  // Ridisegna la barra del tempo
    
    // Muove la barra per ogni battito
    timeBarX = ((beatCount-1) / (beatsPerBar * numberOfBars)) * staffLength;

    requestAnimationFrame(animateTimeBar);  // Continua l'animazione
}

// -------------------- Controllo Barra del Tempo e Metronomo Sincronizzati --------------------

let metronomePlaying = false;
const startMetronomeButton = document.getElementById('startMetronomeButton');
const stopMetronomeButton = document.getElementById('stopMetronomeButton');

startMetronomeButton.addEventListener('click', startMetronome);
stopMetronomeButton.addEventListener('click', stopMetronome);

function startMetronome() {
    if (!metronomePlaying) {
        metronomePlaying = true;
        beatCount = 0;  // Resetta il conteggio dei battiti all'inizio
        timeBarX = 0;   // Reset della posizione della barra del tempo

        // Disegna la barra al punto zero immediatamente
        clearStaff();
        drawStaffLines();
        drawTimeBar();  // Barra iniziale a 0

        // Avvia il metronomo e la barra sincronizzati
        metronomeIntervalId = setInterval(() => {
            
            // Suona il click del metronomo
            if (beatCount % beatsPerBar === 0) {
                playMetronomeAccent();  // Primo battito accentato
                timeBarX = 0;  // Reset della barra esattamente sul primo colpo
            } else {
                playMetronomeClick();  // Battiti normali
            }

            // Movimento della barra del tempo sincronizzato al battito
            if (isTimeBarActive) {
                timeBarX = (beatCount / beatsPerBar) * (staffLength / numberOfBars);  // Sposta la barra
            }

            // Disegna la barra del tempo
            clearStaff();
            drawStaffLines();
            drawTimeBar();

            // Incrementa il contatore dei battiti
            beatCount++;

            // Se raggiunge il numero totale di battiti (numero di battute * battiti per battuta)
            if (beatCount > beatsPerBar * numberOfBars) {
                beatCount = 1;  // Resetta il contatore dei battiti
                timeBarX = 0;  // Torna alla posizione iniziale della barra
            }

        }, beatDuration);  // Imposta l'intervallo basato sulla durata di un battito
    }
}


function stopMetronome() {
    clearInterval(metronomeIntervalId);
    metronomePlaying = false;
    timeBarX = 0;  // Reset della posizione della barra del tempo quando il metronomo si ferma
    beatCount = 0;  // Reset del contatore dei battiti
    clearStaff();  // Pulisce il pentagramma
    drawStaffLines();  // Ridisegna il pentagramma
    if (isTimeBarActive) {
        drawTimeBar();  // Ridisegna la barra del tempo in posizione 0
    }
}

// Funzione per il click normale del metronomo
function playMetronomeClick() {
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

