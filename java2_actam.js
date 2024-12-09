let currentOctave = 3; // Ottava corrente, parte da C3-F4
let currentSet = 1; // Set di timbri corrente

// Definisci i nomi dei timbri per i 4 set
const soundSets = {
    1: 'keyboard/timbro1',
    2: 'keyboard/timbro2',
    3: 'keyboard/timbro3',
    4: 'keyboard/timbro4'
};


// Getting files for the different ambients
let dati; // Variabile per salvare i dati JSON
let ambienteCorrente;
let setCorrente;

fetch('Enviroments.json')
  .then(response => response.json())
  .then(data => {
    dati = data;
    popolaMenuAmbienti(data.ambienti);
  })
  .catch(error => console.error('Errore nel caricamento del JSON:', error));

function popolaMenuAmbienti(ambienti) {
  const ambienteSelect = document.getElementById('ambienteSelect');
  ambienti.forEach(ambiente => {
    const option = document.createElement('option');
    option.value = ambiente.nome;
    option.textContent = ambiente.nome;
    ambienteSelect.appendChild(option);
  });
}

function cambiaAmbiente() {
  const ambienteSelect = document.getElementById('ambienteSelect');
  const setSuoniSelect = document.getElementById('setSuoniSelect');
  const suoniContainer = document.getElementById('suoniContainer');

  suoniContainer.innerHTML = ''; // Reset
  setSuoniSelect.style.display = 'none'; // Nascondi finché non c'è un ambiente selezionato

  ambienteCorrente = dati.ambienti.find(a => a.nome === ambienteSelect.value);

  if (ambienteCorrente) {
    setSuoniSelect.innerHTML = '<option value="">Seleziona un set di suoni</option>';
    ambienteCorrente.setSuoni.forEach(set => {
      const option = document.createElement('option');
      option.value = set.nome;
      option.textContent = set.nome;
      setSuoniSelect.appendChild(option);
    });
    setSuoniSelect.style.display = 'block'; // Mostra menu set di suoni
  }
}



function cambiaSetSuoni() {
  const setSuoniSelect = document.getElementById('setSuoniSelect');
  const suoniContainer = document.getElementById('suoniContainer');

  suoniContainer.innerHTML = ''; // Reset
  setCorrente = ambienteCorrente.setSuoni.find(set => set.nome === setSuoniSelect.value);

  if (setCorrente) {
    Object.keys(setCorrente.suoni).forEach(chiave => {
      const button = document.createElement('button');
      button.textContent = chiave; // Nome del suono
      button.onclick = () => cambiaSuono(setCorrente.suoni[chiave]);
      suoniContainer.appendChild(button);
    });
  }
}

function cambiaSuono(url) {
  const audioPlayer = document.getElementById('audioPlayer');
  audioPlayer.src = url;
  audioPlayer.play();
}

  

window.keyMapOctave1 = {
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

window.keyMapOctave2 = {
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

// Garantisce che il tuo AudioContext sia pronto per funzionare senza blocchi
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log("AudioContext avviato dopo il clic dell'utente.");
        });
    }
});


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
    if (!activeNotes[note]) {
        activeNotes[note] = [];
    }

    // Memorizza l'istanza audio nella lista
    activeNotes[note].push(audio);

    // Connetti alla destinazione
    track.connect(audioContext.destination);

    console.log(`Riproduzione nota: ${note}, istanze attive: ${activeNotes[note].length}`);

    // Avvia la riproduzione
    audio.play().catch(error => console.error("Errore nel caricamento dell'audio: ", error));

     // Event listener per rimuovere l'istanza audio una volta terminata
     audio.addEventListener('ended', () => {
        const index = activeNotes[note].indexOf(audio);
        if (index > -1) {
            activeNotes[note].splice(index, 1);
        }
        console.log(`Nota ${note} terminata, rimosso audio. Istanze rimanenti: ${activeNotes[note].length}`);
    });
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
    if (activeNotes[note] && activeNotes[note].length > 0) {
        console.log(`Stop nota: ${note}, istanze attive: ${activeNotes[note].length}`);

        // Ferma solo una istanza alla volta
        const audio = activeNotes[note].shift(); // Rimuove la prima istanza dal fronte dell'array
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            console.log(`Una istanza di ${note} fermata. Rimangono ${activeNotes[note].length} istanze.`);
        }

        // Se l'array è vuoto, elimina la chiave
        if (activeNotes[note].length === 0) {
            delete activeNotes[note];
            console.log(`Tutte le istanze di ${note} sono state fermate e cancellate.`);
        }
    } else {
        console.warn(`Nota ${note} non trovata o già fermata.`);
    }
}


// Funzione per attivare una nota (sia da tastiera che da mouse)
function activateNote(note, source, startTime = performance.now()) {
    if (!note || pressedKeys[note]) return;

    playNote(note); // Riproduci il suono della nota
    highlightKey(note); // Evidenzia il tasto
    pressedKeys[note] = true;

    console.log(`Nota attivata da ${source}: ${note}`);

    // Inizializza il rettangolo per la nota attiva
    activeRectangles[note] = {
        note: note,
        x: timeBarX,  // Posizione iniziale basata su timeBarX
        y: getYPositionForNote(note), // Calcola la posizione verticale
        width: 0,  // Partiamo con larghezza 0
        startTime: startTime
    };

    // Disegna i rettangoli attivi sul canvas
    for (let key in activeRectangles) {
        drawActiveRectangle(activeRectangles[key]);
    }

    // Se una traccia è in registrazione, registra l'evento
    if (activeTrackIndex !== -1 && tracks[activeTrackIndex].isRecording) {
        const noteData = {
            note: note,
            startTime: startTime,
            duration: null // Durata sarà calcolata al rilascio del tasto
        };

        // Salva la nota nella traccia attiva
        tracks[activeTrackIndex].audioData.push(noteData);
        console.log(`Registrata nota ${note} sulla traccia ${activeTrackIndex + 1}`, noteData);
    }

    // Inizia ad aggiornare il rettangolo
    requestAnimationFrame(() => updateRectangle(note));
}

// Gestione pressione tasti da tastiera
document.addEventListener('keydown', function(event) {
    const dataKey = event.key.toUpperCase();
    const note = keyMap[dataKey];
    if (note) {
        activateNote(note, "tastiera");
    }
});

// Gestione rilascio tasti da tastiera
document.addEventListener('keyup', function(event) {
    const dataKey = event.key.toUpperCase();
    const note = keyMap[dataKey];
    if (note) {
        unhighlightKey(note);
        stopNote(note);
        pressedKeys[note] = false;

        // Fissa la larghezza finale e aggiungi il rettangolo a `playedNotes`
        const rectangle = activeRectangles[note];
        if (rectangle) {
            playedNotes.push({
                note: rectangle.note,
                x: rectangle.x,
                y: rectangle.y,
                width: rectangle.width,
                height: 10,
                color: noteColors[rectangle.note] || "black"
            });

            // Disegna la nota fissata
            drawFixedNoteOnStaff(rectangle.note, rectangle.x, rectangle.y, rectangle.width, 10, noteColors[rectangle.note] || "black");

            // Rimuovi il rettangolo dall’oggetto `activeRectangles`
            delete activeRectangles[note];
        }

        // Aggiorna la durata della nota nella traccia attiva (se presente)
        if (activeTrackIndex !== -1 && tracks[activeTrackIndex].isRecording) {
            const track = tracks[activeTrackIndex];
            const noteEvent = track.audioData.find((n) => n.note === note && n.duration === null);
            if (noteEvent) {
                noteEvent.duration = performance.now() - noteEvent.startTime;
                console.log(`Rilasciata nota ${note}, durata: ${noteEvent.duration}ms sulla traccia ${activeTrackIndex + 1}`);
            }
        }
    }
});

// Aggiungi ascoltatori per il clic sui tasti della pianola
const keys = document.querySelectorAll('.tasto, .tasto-nero'); // Seleziona sia i tasti bianchi che quelli neri
keys.forEach(key => {
    key.addEventListener('mousedown', function(event) {
        event.stopPropagation(); // Evita che il clic passi al canvas
        const note = this.getAttribute('data-note');
        if (note) {
            activateNote(note, "mouse");
        }
    });

    key.addEventListener('mouseup', function() {
        const note = this.getAttribute('data-note');
        if (note) {
            unhighlightKey(note);
            stopNote(note);
            pressedKeys[note] = false;

            // Fissa la larghezza finale e aggiungi il rettangolo a `playedNotes`
            const rectangle = activeRectangles[note];
            if (rectangle) {
                playedNotes.push({
                    note: rectangle.note,
                    x: rectangle.x,
                    y: rectangle.y,
                    width: rectangle.width,
                    height: 10,
                    color: noteColors[rectangle.note] || "black"
                });

                // Disegna la nota fissata
                drawFixedNoteOnStaff(rectangle.note, rectangle.x, rectangle.y, rectangle.width, 10, noteColors[rectangle.note] || "black");

                // Rimuovi il rettangolo dall’oggetto `activeRectangles`
                delete activeRectangles[note];
            }

            // Aggiorna la durata della nota nella traccia attiva (se presente)
            if (activeTrackIndex !== -1 && tracks[activeTrackIndex].isRecording) {
                const track = tracks[activeTrackIndex];
                const noteEvent = track.audioData.find((n) => n.note === note && n.duration === null);
                if (noteEvent) {
                    noteEvent.duration = performance.now() - noteEvent.startTime;
                    console.log(`Rilasciata nota ${note}, durata: ${noteEvent.duration}ms sulla traccia ${activeTrackIndex + 1}`);
                }
            }
        }
    });

    key.addEventListener('mouseleave', function() {
        const note = this.getAttribute('data-note');
        if (note) {
            unhighlightKey(note);
            stopNote(note);
            pressedKeys[note] = false;

            // Se il mouse esce dal tasto, chiudiamo il rettangolo attivo
            const rectangle = activeRectangles[note];
            if (rectangle) {
                playedNotes.push({
                    note: rectangle.note,
                    x: rectangle.x,
                    y: rectangle.y,
                    width: rectangle.width,
                    height: 10,
                    color: noteColors[rectangle.note] || "black"
                });

                drawFixedNoteOnStaff(rectangle.note, rectangle.x, rectangle.y, rectangle.width, 10, noteColors[rectangle.note] || "black");
                delete activeRectangles[note];
            }
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
// Evento mousedown per numeri del pad
pads.forEach(pad => {
    pad.addEventListener('mousedown', () => {
        const key = pad.getAttribute('data-key');
        if (!pressedPads[key]) {
            const number = parseInt(pad.textContent.trim());
            playPadSound(pad);
            pad.classList.add('key-active');
            pad.classList.add('active-text');
            pressedPads[key] = true;

            if (number >= 1 && number <= 9) {
                const x = metronomePlaying ? timeBarX : lastBarX; // Usa la posizione corrente
                let color = "black"; // Default nero

                // Cambia colore solo se il metronomo è fermo
                if (!metronomePlaying && activeNumbersWithPositions.some(n => n.number === number)) {
                    color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Colore casuale
                }

                activeNumbersWithPositions.push({ number, x, color }); // Salva numero con posizione e colore
                drawAllNumbers(); // Ridisegna i numeri
            }
        }
    });

    pad.addEventListener('mouseup', () => {
        const key = pad.getAttribute('data-key');
        pad.classList.remove('key-active');
        pad.classList.remove('active-text');
        pressedPads[key] = false;
    });

    pad.addEventListener('mouseleave', () => {
        const key = pad.getAttribute('data-key');
        pad.classList.remove('key-active');
        pad.classList.remove('active-text');
        pressedPads[key] = false;
    });
});


document.addEventListener('keydown', (e) => {
    const key = e.keyCode;
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad && !pressedPads[key]) {
        playPadSound(pad);
        pad.classList.add('key-active');
        pad.classList.add('active-text');
        pressedPads[key] = true;

        const number = parseInt(pad.textContent.trim());
        if (number >= 1 && number <= 9) {
            const x = metronomePlaying ? timeBarX : lastBarX; // Usa la posizione corrente
            let color = "black"; // Default nero

            // Cambia colore solo se il metronomo è fermo
            if (!metronomePlaying && activeNumbersWithPositions.some(n => n.number === number)) {
                color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Colore casuale
            }

            activeNumbersWithPositions.push({ number, x, color }); // Salva numero con posizione e colore
            drawAllNumbers(); // Ridisegna i numeri
        }
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.keyCode;
    const pad = document.querySelector(`.pad[data-key="${key}"]`);
    if (pad) {
        pad.classList.remove('key-active');
        pad.classList.remove('active-text');
        pressedPads[key] = false;
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
    //clearStaff();  // Pulisce il pentagramma
    //drawStaffLines();  // Ridisegna le linee del pentagramma
    timeBarX = 0;  // Reset della posizione della barra
});



let playedNotes = [];  // Array per memorizzare le note già suonate
let performanceStartTime = performance.now();  // Momento in cui la performance inizia
let lastNoteTime = performanceStartTime;  // Tempo dell'ultima nota suonata
let totalBeats = numberOfBars * beatsPerBar;  // Numero totale di battiti
const barWidthPerBeat = canvas.width / totalBeats; // Quantità di pixel di spostamento per ogni battito
//let canvasWidthPerBeat = canvas.width / totalBeats;  // Spazio che ogni battito deve occupare nel canvas
const toleranceWindow = barWidthPerBeat * 0.2;  // Finestra di tolleranza per allineare la nota alla barra
// Variabile per tracciare i tempi di inizio della pressione dei tasti
let keyDownTimes = {};
let activeRectangles = {};  // Oggetto per memorizzare i rettangoli attivi e i tempi di pressione
let canvasReset = false;  // Nuova variabile per tracciare se il canvas è stato rigenerato



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

// Disegna il rettangolo attivo che si allarga dinamicamente
function drawActiveRectangle(rectangle) {
    ctx.fillStyle = noteColors[rectangle.note] || "black";
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, 10);  // Usa la posizione x dinamica
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    let displayNote = rectangle.note.includes("sharp") ? rectangle.note.replace("sharp", "#") : rectangle.note;
    ctx.fillText(displayNote, rectangle.x + rectangle.width + 5, rectangle.y + 5);
}

// Disegna una nota fissata sul pentagramma
function drawFixedNoteOnStaff(note, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Mostra il nome della nota accanto al rettangolo
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    let displayNote = note.includes("sharp") ? note.replace("sharp", "#") : note;
    ctx.fillText(displayNote, x + width + 5, y + height / 2);
}



// Funzione per aggiornare la larghezza del rettangolo attivo mentre il tasto è premuto
function updateRectangle(dataKey) {
    if (!activeRectangles[dataKey]) return; // Esci se il rettangolo non è più attivo

    const rectangle = activeRectangles[dataKey];
    const currentTime = performance.now();
    const duration = (currentTime - rectangle.startTime) / 1000; // Durata in secondi

    // Calcola la larghezza basata sulla durata
    rectangle.width = duration * 100; // Aggiusta il moltiplicatore a piacere

    // Gestisce il ciclo continuo: se `timeBarX` torna a zero, reimposta `x` del rettangolo a 0
    if (canvasReset) {
        rectangle.x = lastBarX || 0; // Usa `lastBarX` o l'inizio del canvas
        canvasReset = false; // Resetta la variabile
    }

    // Pulisci e ridisegna il pentagramma per aggiornare la posizione in tempo reale
    clearStaff();
    drawTimeBar(); // Ridisegna la barra del tempo se attiva
    redrawNotes(); // Ridisegna tutte le note fisse

    // Disegna tutti i rettangoli attivi
    for (let key in activeRectangles) {
        drawActiveRectangle(activeRectangles[key]);
    }

    // Ridisegna i numeri sopra i rettangoli
    drawAllNumbers();

    // Continua ad aggiornare finché il tasto è premuto
    requestAnimationFrame(() => updateRectangle(dataKey));
}



// Ridisegna tutte le note fissate già suonate
function redrawNotes() {
    playedNotes.forEach(note => {
        drawFixedNoteOnStaff(note.note, note.x, note.y, note.width, note.height, note.color);
    });
}


// Funzione per pulire il pentagramma ma non cancellare le note
function clearStaff(preserveNotes = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (preserveNotes) {
        redrawNotes();
        drawReferenceBars();
    }
}


// Funzione per cancellare tutte le note dal canvas
function clearAllNotes() {
    playedNotes = []; // Svuota l'array delle note suonate
    activeNumbersWithPositions = []; // Svuota anche i numeri
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisce l'intero canvas

    drawReferenceBars(); // Ridisegna le barre di riferimento statiche

    // Ridisegna la barra se il metronomo è fermo
    if (!isTimeBarActive) {
        drawTimeBar(); // Ridisegna la barra alla posizione corrente
    }
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
    ctx.lineWidth = 4; // Imposta la larghezza della linea
    ctx.beginPath();

    // Usa `timeBarX` se la barra è attiva, altrimenti `lastBarX`
    const roundedX = Math.round(isTimeBarActive ? timeBarX : lastBarX);
    ctx.moveTo(roundedX, 0); // Inizia la linea in alto

    // Imposta il colore della barra
    ctx.strokeStyle = beatCount % beatsPerBar === 0 ? "green" : "red";

    ctx.lineTo(roundedX, canvas.height); // Disegna la linea fino in basso
    ctx.stroke(); // Esegui il disegno
}



function startTimeBar() {
    if (!isTimeBarActive) {
        isTimeBarActive = true;

        // Calcola il tempo di partenza per sincronizzare correttamente la barra
        const elapsedFromLastStop = (lastBarX / barWidth) * beatDuration * beatsPerBar;
        performanceStartTime = performance.now() - elapsedFromLastStop;

        timeBarX = lastBarX; // Riprende dalla posizione corrente
        requestAnimationFrame(animateTimeBar); // Inizia l'animazione della barra del tempo
    }
}


// Funzione per fermare la barra del tempo

function stopTimeBar() {
    isTimeBarActive = false; // Ferma la barra
    lastBarX = Math.round(timeBarX); // Salva la posizione corrente in modo preciso
}


// Funzione per animare la barra del tempo
function animateTimeBar() {
    if (!isTimeBarActive) return; // Esci se la barra del tempo non è attiva

    clearStaff(); // Pulisce il pentagramma
    drawTimeBar(); // Ridisegna la barra del tempo

    // Calcolo del tempo reale
    const currentTime = performance.now();
    const elapsedTime = currentTime - performanceStartTime; // Tempo trascorso dall'inizio della performance

    // Durata totale di una battuta (in millisecondi)
    const barDuration = beatDuration * beatsPerBar;

    // Calcola la posizione attuale all'interno della battuta corrente
    const progressInBar = (elapsedTime % barDuration) / barDuration;

    // Calcola `timeBarX` come frazione della larghezza della battuta
    timeBarX = progressInBar * barWidth;

    // Calcola quante barre sono passate
    const barsElapsed = Math.floor(elapsedTime / barDuration);
    timeBarX += barsElapsed * barWidth;

    // Allinea la posizione della barra alla larghezza del canvas
    if (timeBarX >= canvas.width) {
        timeBarX %= canvas.width; // Torna all'inizio ma continua in modo fluido
        beatCount = 0; // Resetta il conteggio dei battiti
        performanceStartTime = currentTime; // Sincronizza il tempo
    }

    // Aggiorna `beatCount` basato su `elapsedTime`
    beatCount = Math.floor((elapsedTime / beatDuration) % beatsPerBar);

    drawAllNumbers(); // Ridisegna i numeri sincronizzati
    requestAnimationFrame(animateTimeBar); // Continua l'animazione
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
});



//----------------ZOOOOOOOOOOOOOOOOOOOOOOOOOOOOM--------------------------//

let isZoomedIn = false;  // Variabile per tenere traccia dello stato di zoom
let originalCanvasWidth = canvas.width;  // Salva la larghezza originale del canvas in pixel
let originalCanvasStyleWidth = canvas.style.width;  // Salva lo stile originale in CSS

function toggleZoom() {
    const zoomFactor = 1.1; // Fattore di ingrandimento per la larghezza visualizzata
    const zoomButton = document.getElementById('zoomButton');

    if (!isZoomedIn) {
        // Ingrandisci solo visivamente la larghezza del canvas usando style.width
        canvas.style.width = `${originalCanvasWidth * zoomFactor}px`; // Applica lo zoom alla larghezza
        zoomButton.textContent = '🔍 -'; // Cambia icona del bottone
    } else {
        // Torna alla larghezza visiva originale senza modificare canvas.width
        canvas.style.width = originalCanvasStyleWidth;
        zoomButton.textContent = '🔍 +';
    }

    isZoomedIn = !isZoomedIn; // Cambia lo stato dello zoom

    // Aggiorna e ridisegna gli elementi sul canvas
    clearStaff(); // Cancella il contenuto del canvas
    drawReferenceBars(); // Ridisegna le barre di riferimento
    redrawNotes(); // Ridisegna le note della tastiera
    drawAllNumbers(); // Ridisegna anche i numeri del pad
}




// ---------------- REGISTRATORE MULTITRACCIA --------------------------//


// Variabili globali per la registrazione e il Pre-Roll
let activeTrackIndex = -1; // Indice della traccia attualmente in registrazione
let isGlobalRecording = false; // Stato della registrazione globale
const preRollBars = 2; // Numero di battute per il Pre-Roll (configurabile)
let isPreRollActive = false; // Flag per verificare se il Pre-Roll è attivo

const tracks = Array(4).fill(null).map(() => ({
    audioData: [], // Array per memorizzare le note registrate
    isRecording: false,
    recordStartTime: null, // Tempo d'inizio reale della registrazione
}));

// Funzione per avviare la registrazione con Pre-Roll
function startRecordingWithPreRoll(trackIndex) {
    if (isGlobalRecording || isPreRollActive) return; // Evita conflitti

    isPreRollActive = true;
    const totalPreRollDuration = preRollBars * beatsPerBar * beatDuration; // Durata totale del Pre-Roll in ms

    console.log(`Inizio Pre-Roll di ${preRollBars} battute (${totalPreRollDuration} ms)`);

    // Dopo il Pre-Roll, avvia la registrazione
    setTimeout(() => {
        isPreRollActive = false;
        startRecording(trackIndex);
        tracks[trackIndex].recordStartTime = performance.now();
        console.log(`Registrazione iniziata sulla traccia ${trackIndex + 1}`);
    }, totalPreRollDuration);
}


// Funzione per iniziare la registrazione
function startRecording(trackIndex) {
    activeTrackIndex = trackIndex;
    const track = tracks[trackIndex];
    track.audioData = []; // Resetta i dati precedenti
    track.isRecording = true;
    isGlobalRecording = true; // Segna che una registrazione è in corso
    console.log(`Registrazione attiva sulla traccia ${trackIndex + 1}`);
}

// Funzione per terminare la registrazione
function stopRecording(trackIndex) {
    const track = tracks[trackIndex];
    track.isRecording = false;
    activeTrackIndex = -1;
    isGlobalRecording = false;
    console.log(`Registrazione terminata sulla traccia ${trackIndex + 1}`);
}


// Funzione per riprodurre una traccia
function playTrack(trackIndex) {
    const track = tracks[trackIndex];
    if (!track.audioData.length) {
        console.log(`Nessuna nota registrata sulla traccia ${trackIndex + 1}`);
        return;
    }

    const playbackOffset = preRollBars * beatsPerBar * beatDuration; // Offset Pre-Roll
    const globalStartTime = performance.now(); // Tempo di avvio globale

    console.log(`Riproduzione della traccia ${trackIndex + 1}, includendo l'offset di ${preRollBars} battute.`);

    // Pianifica la riproduzione delle note registrate
    track.audioData.forEach(noteData => {
        const notePlaybackTime = globalStartTime + (noteData.startTime - track.recordStartTime) + playbackOffset;
        const delay = notePlaybackTime - performance.now();

        if (delay >= 0) {
            setTimeout(() => {
                playNote(noteData.note); // Riproduci la nota

                // Ferma la nota dopo la durata specificata
                if (noteData.duration) {
                    setTimeout(() => {
                        stopNote(noteData.note); // Ferma la nota
                    }, noteData.duration);
                }
            }, delay);
        }
    });
}




// Funzione per evidenziare il canvas durante la registrazione
function highlightTrackCanvas(trackIndex, isRecording) {
    const canvas = document.getElementById(`track-canvas-${trackIndex + 1}`);
    canvas.style.border = isRecording ? "2px solid red" : "1px solid #555";
}


//TOLTE FUNZIONI DI DRAW E SAVE


// Funzione per disegnare i rettangoli su una traccia (per visualizzazione)
// Elemento canvas principale
const mainCanvas = document.getElementById('staffCanvas');

// Funzione per copiare il contenuto del canvas principale al canvas di una traccia
function copyCanvasToTrack(trackIndex) {
    const trackCanvas = document.getElementById(`track-canvas-${trackIndex}`);
    const trackCtx = trackCanvas.getContext('2d');

    // Ottieni l'immagine dal canvas principale
    const imageData = mainCanvas.toDataURL();

    // Crea un oggetto immagine
    const image = new Image();
    image.onload = function () {
        // Ridimensiona il canvas della traccia
        trackCanvas.width = mainCanvas.width;
        trackCanvas.height = mainCanvas.height;

        // Disegna l'immagine
        trackCtx.clearRect(0, 0, trackCanvas.width, trackCanvas.height);
        trackCtx.drawImage(image, 0, 0);
    };

    image.src = imageData; // Imposta la sorgente dell'immagine
}





// Funzione per cancellare una traccia (audio e contenuto visivo del canvas)
function deleteTrack(trackIndex) {
    // Cancella i dati audio della traccia
    tracks[trackIndex].audioData = [];
    
    // Ottieni il canvas della traccia corrispondente
    const trackCanvas = document.getElementById(`track-canvas-${trackIndex + 1}`);
    if (trackCanvas) {
        const trackCtx = trackCanvas.getContext('2d');
        
        // Cancella il contenuto del canvas
        trackCtx.clearRect(0, 0, trackCanvas.width, trackCanvas.height);
        console.log(`Cancellato contenuto visivo del canvas per la traccia ${trackIndex + 1}`);
    } else {
        console.warn(`Canvas per la traccia ${trackIndex + 1} non trovato.`);
    }

    console.log(`Cancellata traccia ${trackIndex + 1}`);
}



const maxVolume = 20; // Volume massimo configurabile (moltiplicatore)

// Funzione per aggiornare il volume di una traccia
function updateVolume(trackIndex, volume) {
    const scaledVolume = volume * maxVolume; // Scala il volume in base al massimo
    tracks[trackIndex].volume = scaledVolume;
    console.log(`Volume traccia ${trackIndex + 1} aggiornato a: ${scaledVolume}`);
}



// Event listeners per i pulsanti di registrazione
document.querySelectorAll('.record-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const trackIndex = parseInt(btn.dataset.track, 10) - 1;

        if (tracks[trackIndex].isRecording) {
            // Ferma la registrazione
            stopRecording(trackIndex);
            btn.textContent = 'Rec'; // Cambia il testo del pulsante
        } else {
            // Avvia la registrazione con Pre-Roll
            startRecordingWithPreRoll(trackIndex);
            btn.textContent = 'Stop'; // Cambia il testo del pulsante
        }
    });
});



// Event listeners per i pulsanti di riproduzione
document.querySelectorAll('.play-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const trackIndex = parseInt(btn.dataset.track, 10) - 1;
        playTrack(trackIndex); // Riproduce la traccia
        console.log(`Riproduzione traccia ${trackIndex + 1}`);
    });
});


document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const trackIndex = parseInt(btn.dataset.track) - 1;
        deleteTrack(trackIndex);
    });
});

document.querySelectorAll('.volume-slider').forEach((slider) => {
    slider.addEventListener('input', () => {
        const trackIndex = parseInt(slider.dataset.track) - 1;
        const value = parseFloat(slider.value); // Valore tra 0 e 1
        updateVolume(trackIndex, value);
    });
});


// Event listener per i pulsanti "Copy Canvas"
document.querySelectorAll('.copy-canvas-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const trackIndex = button.dataset.track; // Ottieni l'indice della traccia
        copyCanvasToTrack(trackIndex); // Copia il contenuto
        console.log(`Canvas principale copiato nella traccia ${trackIndex}`);
    });
});


// Funzione per riprodurre tutte le tracce insieme
document.getElementById('global-play').addEventListener('click', () => {
    console.log('Riproduzione di tutte le tracce');
    tracks.forEach((track, index) => playTrack(index));
});

// Funzione per scaricare tutte le tracce come audio mixato
document.getElementById('download-audio').addEventListener('click', () => {
    console.log('Scaricamento dell\'audio mixato');
    // Implementazione della logica per il mixaggio e download
});




///--------------------------------------------------------------NUMBERS ON CANVAS--------------------------------------------------

let activeNumbersWithPositions = []; // Array di numeri con posizioni { number, x }
let activeNumbers = []; // Array per i numeri attivi nel canvas
const maxNumbersOnCanvas = 9; // Numero massimo di numeri nel canvas
let numberColors = {}; // Mappa per tracciare i colori dei numeri
const defaultColor = "black"; // Colore di default
let lastBarX = 0;


// Funzione per ottenere la posizione verticale di un numero nel canvas
function getYPositionForNumber(number) {
    const canvasHeight = canvas.height;
    const step = canvasHeight / maxNumbersOnCanvas;
    return canvasHeight - step * number + step / 2; // Calcola posizione basata su canvas
}

function drawNumberOnCanvas(number, x, color) {
    const y = getYPositionForNumber(number); // Ottieni la posizione verticale
    ctx.fillStyle = color; // Usa il colore specifico del numero
    ctx.font = "16px Arial";
    ctx.fillText(number, x, y); // Disegna il numero nel canvas
}



function drawAllNumbers() {
    activeNumbersWithPositions.forEach(({ number, x, color }) => {
        drawNumberOnCanvas(number, x, color); // Usa il colore specifico di questa istanza
    });
}


activeNumbersWithPositions.push({
    number,
    x,
    color: numberColors[number] || defaultColor // Colore iniziale
});

