// Definire il mapping dei tasti della tastiera
const keyMap = {
    '1': 'C',
    '2': 'C#',
    '3': 'D',
    '4': 'D#',
    '5': 'E',
    '6': 'F',
    '7': 'F#',
    '8': 'G',
    '9': 'G#',
    '0': 'A',
    '-': 'A#',
    '=': 'B'
};

// Aggiungi un ascoltatore per la pressione dei tasti
document.addEventListener('keydown', function(event) {
    const note = keyMap[event.key];
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
