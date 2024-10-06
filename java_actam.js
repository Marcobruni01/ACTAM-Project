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
let effectNode = null;

// Funzione per riprodurre il suono della nota con effetti
function playNote(note) {
    const audio = new Audio(`sounds/keyboard/${note}.mp3`);
    const track = audioContext.createMediaElementSource(audio);
    
    // Applica l'effetto selezionato
    applyEffect(track);

    track.connect(audioContext.destination);
    audio.play();
}

// Aggiungi un ascoltatore per la pressione dei tasti
document.addEventListener('keydown', function(event) {
    const note = keyMap[event.key.toUpperCase()];
    if (note) {
        playNote(note);
        highlightKey(note);
    }
});

// Aggiungi un ascoltatore per il clic sui tasti della pianola
const keys = document.querySelectorAll('.tasto');
keys.forEach(key => {
    key.addEventListener('click', function() {
        const note = this.getAttribute('data-note');
        playNote(note);
        highlightKey(note);
    });
});

// Funzione per evidenziare il tasto
function highlightKey(note) {
    const tasto = document.querySelector(`[data-note="${note}"]`);
    if (tasto) {
        tasto.classList.add('active');
        setTimeout(() => {
            tasto.classList.remove('active');
        }, 200);
    }
}

// Funzione per applicare l'effetto selezionato
function applyEffect(track) {
    const effectSelect = document.getElementById('effect-select');
    const selectedEffect = effectSelect.value;

    if (effectNode) {
        effectNode.disconnect(); // Rimuovi l'effetto precedente
    }

    switch (selectedEffect) {
        case 'flanger':
            effectNode = createFlanger();
            break;
        case 'delay':
            effectNode = createDelay();
            break;
        case 'distortion':
            effectNode = createDistortion();
            break;
        default:
            effectNode = null;
    }

    if (effectNode) {
        track.connect(effectNode).connect(audioContext.destination);
    } else {
        track.connect(audioContext.destination);
    }
}

// Funzioni per creare i vari effetti
function createReverb() {
    const convolver = audioContext.createConvolver();
    fetch('sounds/effects/reverb.wav')
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => convolver.buffer = buffer);
    return convolver;
}

function createFlanger() {
    const delay = audioContext.createDelay();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    delay.delayTime.value = 0.005;
    osc.frequency.value = 0.5;
    gain.gain.value = 0.002;
    
    osc.connect(gain);
    gain.connect(delay.delayTime);
    osc.start();
    
    return delay;
}

function createDelay() {
    const delay = audioContext.createDelay();
    delay.delayTime.value = 0.4;  // Durata del ritardo (puoi regolare questo valore)

    const feedback = audioContext.createGain();
    feedback.gain.value = 0.5;  // Volume del feedback, più vicino a 1 significa più ripetizioni

    // Connetti il delay al nodo feedback e poi di nuovo al delay
    delay.connect(feedback);
    feedback.connect(delay);

    return delay;
}


function createDistortion() {
    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(400);
    distortion.oversample = '4x';
    return distortion;
}

function makeDistortionCurve(amount) {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}

// ----------------------- Pad -----------------------------

// Seleziona tutti i tasti del pad
const pads = document.querySelectorAll('.pad');

// Aggiungi evento click ai tasti del pad
pads.forEach(pad => {
    pad.addEventListener('click', () => {
        console.log(pad); // Log per il debug
        playSound(pad);
        pad.classList.add('key-active');  // Aggiunge l'effetto visivo
        setTimeout(() => pad.classList.remove('key-active'), 200);  // Rimuove l'effetto dopo 200ms
    });
});

// Ascolta per la pressione dei tasti numerici
document.addEventListener('keydown', (e) => {
    const key = e.keyCode;
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
        console.log(pad); // Log per il debug
        playSound(pad);
        pad.classList.add('key-active');  // Aggiunge l'effetto visivo
        setTimeout(() => pad.classList.remove('key-active'), 200);  // Rimuove l'effetto dopo 200ms
    }
});

// Rimuovi l'effetto visivo quando il tasto viene rilasciato
document.addEventListener('keyup', (e) => {
    const key = e.keyCode;
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
        pad.classList.remove('key-active');  // Rimuove l'effetto visivo
    }
});

// Funzione per riprodurre i suoni del pad
function playSound(pad) {
    const sound = pad.getAttribute('data-sound');
    const audio = new Audio(`sounds/pad/${sound}.mp3`);
    audio.play().catch(error => console.error("Errore nel caricamento dell'audio: ", error));
}
