// Definire il mapping dei tasti della tastiera
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

// Funzione per riprodurre il suono della nota
function playNote(note) {
    const audio = new Audio(`sounds/keyboard/${note}.mp3`);
    audio.play();
}

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




//PAD
//PAD
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

// Funzione per riprodurre i suoni
function playSound(pad) {
    const sound = pad.getAttribute('data-sound');
    const audio = new Audio(`sounds/pad/${sound}.mp3`);
    audio.play().catch(error => console.error("Errore nel caricamento dell'audio: ", error));
}
