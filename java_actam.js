// Definire il mapping dei tasti della tastiera
const keyMap = {
    '1': 'C',
    '2': 'D',
    '3': 'E',
    '4': 'F',
    '5': 'G',
    '6': 'A',
    '7': 'B',
    '8': 'C2',
    '9': 'D2',
    '0': 'E2',
    '-': 'F2',
    '=': 'G2'
};

// Aggiungi un ascoltatore per la pressione dei tasti
document.addEventListener('keydown', function(event) {
    const note = keyMap[event.key];
    if (note) {
        playNote(note);
        highlightKey(note);
    }
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
