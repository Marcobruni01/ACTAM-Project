document.addEventListener('DOMContentLoaded', () => {
    // Inizializza strumenti
    const kick = new Tone.MembraneSynth().toDestination();
    const snare = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).toDestination();
    const hiHat = new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.001, decay: 0.1, release: 0.8 },
        harmonicity: 5.1,
        modulationIndex: 32
    }).toDestination();
    const bass = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 1.5 }
    }).toDestination();

    // Pattern Kick
    const kickPart = new Tone.Loop(time => {
        kick.triggerAttackRelease('C3', '16n', time);
    }, '2n');

    // Pattern Snare
    const snarePart = new Tone.Loop(time => {
        snare.triggerAttackRelease('16n', time + 0.5);
    }, '2n');

    // Pattern Hi-Hat
    const hiHatPart = new Tone.Loop(time => {
        hiHat.triggerAttackRelease('16n', time);
    }, '4n');

    // Pattern Bassline
    const bassPart = new Tone.Sequence(
        (time, note) => {
            bass.triggerAttackRelease(note, '8n', time);
        },
        ['E2', 'E2', 'G2', 'A2', 'E2', 'E2', 'G2', 'A2'],
        '8n'
    );

    // Stati per tracciare gli strumenti
    let kickPlaying = false;
    let snarePlaying = false;
    let hiHatPlaying = false;
    let bassPlaying = false;
    let allPlaying = false;

    // Funzione per avviare il contesto audio e il trasporto
    async function startTransportIfNeeded() {
        await Tone.start();
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
    }

    // Funzioni per riprodurre strumenti
    async function toggleKick() {
        await startTransportIfNeeded();
        if (!kickPlaying) {
            kickPart.start(0);
            kickPlaying = true;
        } else {
            kickPart.stop();
            kickPlaying = false;
        }
    }

    async function toggleSnare() {
        await startTransportIfNeeded();
        if (!snarePlaying) {
            snarePart.start(0);
            snarePlaying = true;
        } else {
            snarePart.stop();
            snarePlaying = false;
        }
    }

    async function toggleHiHat() {
        await startTransportIfNeeded();
        if (!hiHatPlaying) {
            hiHatPart.start(0);
            hiHatPlaying = true;
        } else {
            hiHatPart.stop();
            hiHatPlaying = false;
        }
    }

    async function toggleBass() {
        await startTransportIfNeeded();
        if (!bassPlaying) {
            bassPart.start(0);
            bassPlaying = true;
        } else {
            bassPart.stop();
            bassPlaying = false;
        }
    }

    async function playAll() {
        await startTransportIfNeeded();
        if (!allPlaying) {
            // Avvia tutti gli strumenti
            kickPart.start(0);
            snarePart.start(0);
            hiHatPart.start(0);
            bassPart.start(0);
            allPlaying = true;
            kickPlaying = snarePlaying = hiHatPlaying = bassPlaying = true;
        } else {
            // Ferma tutti gli strumenti
            kickPart.stop();
            snarePart.stop();
            hiHatPart.stop();
            bassPart.stop();
            allPlaying = false;
            kickPlaying = snarePlaying = hiHatPlaying = bassPlaying = false;
        }
    }

    // Aggiungi eventi ai bottoni
    document.getElementById('kick-btn').addEventListener('click', toggleKick);
    document.getElementById('snare-btn').addEventListener('click', toggleSnare);
    document.getElementById('hihat-btn').addEventListener('click', toggleHiHat);
    document.getElementById('bass-btn').addEventListener('click', toggleBass);
    document.getElementById('play-all').addEventListener('click', playAll);
});
