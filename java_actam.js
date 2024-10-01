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
    const audio = new Audio(`sounds/${note}.mp3`);
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

//comment