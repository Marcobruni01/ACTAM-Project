// ----------------------- Pianola -----------------------------

// Mappatura dei tasti della tastiera per la pianola
const keyMap = {
    'A': 'C',
    'W': 'C#',
    'S': 'D',
    'E': 'D#',
    'D': 'E',
    'F': 'F',
    'T': 'F#',
    'G': 'G',
    'Y': 'G#',
    'H': 'A',
    'U': 'A#',
    'J': 'B',
    'K': 'C2',
    'O': 'C#2',
    'L': 'D2',
    'P': 'D#2',
    'Ò': 'E2',
    'À': 'F2'
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


// Funzione per riprodurre il suono della nota con effetti
function playNote(note) {
    const audio = new Audio(`sounds/keyboard/${note}.mp3`);
    const track = audioContext.createMediaElementSource(audio);

    // Applica gli effetti attivi in catena
    applyActiveEffects(track);

    audio.play();
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

// Mappa per tenere traccia dello stato dei tasti premuti
let pressedKeys = {};

// Aggiungi un ascoltatore per la pressione dei tasti della tastiera
document.addEventListener('keydown', function(event) {
    const note = keyMap[event.key.toUpperCase()];
    if (note && !pressedKeys[event.key.toUpperCase()]) {
        // Suona la nota solo se il tasto non è già stato premuto
        playNote(note);
        highlightKey(note);
        pressedKeys[event.key.toUpperCase()] = true; // Segna il tasto come premuto
    }
});

document.addEventListener('keyup', function(event) {
    const note = keyMap[event.key.toUpperCase()];
    if (note) {
        unhighlightKey(note);
        pressedKeys[event.key.toUpperCase()] = false; // Segna il tasto come rilasciato
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
            pressedKeys[note] = true; // Segna il tasto come premuto
        }
    });

    key.addEventListener('mouseup', function() {
        const note = this.getAttribute('data-note');
        unhighlightKey(note);
        pressedKeys[note] = false; // Segna il tasto come rilasciato
    });

    key.addEventListener('mouseleave', function() {
        const note = this.getAttribute('data-note');
        unhighlightKey(note);
        pressedKeys[note] = false; // Segna il tasto come rilasciato
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


// ----------------------- Pad -----------------------------

// Seleziona tutti i tasti del pad
const pads = document.querySelectorAll('.pad');

// Aggiungi evento click ai tasti del pad
pads.forEach(pad => {
    pad.addEventListener('click', () => {
        playPadSound(pad);
        pad.classList.add('key-active');  // Aggiunge l'effetto visivo
        setTimeout(() => pad.classList.remove('key-active'), 200);  // Rimuove l'effetto dopo 200ms
    });
});

// Ascolta per la pressione dei tasti numerici
document.addEventListener('keydown', (e) => {
    const key = e.keyCode;
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
        playPadSound(pad);
        pad.classList.add('key-active');  // Aggiunge l'effetto visivo
        setTimeout(() => pad.classList.remove('key-active'), 200);  // Rimuove l'effetto dopo 200ms
    }
});

// Funzione per riprodurre i suoni del pad
function playPadSound(pad) {
    const sound = pad.getAttribute('data-sound');
    const audio = new Audio(`sounds/pad/${sound}.mp3`);
    audio.play().catch(error => console.error("Errore nel caricamento dell'audio: ", error));
}