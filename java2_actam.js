let currentOctave = 3; // Three current octave
let currentSet = 1; // Current timbre

// Four timbre set
const soundSets = {
    1: 'keyboard/timbro1',
    2: 'keyboard/timbro2',
    3: 'keyboard/timbro3',
    4: 'keyboard/timbro4'
};


// Getting files for the different ambients
let dati; // Variable for saving JSON data
let ambienteCorrente;
let setCorrente;
let paddone;


// Fetch the 'Enviroments.json' file
fetch('Enviroments.json')
  .then(response => response.json())
  .then(data => {
    dati = data;
    popolaMenuAmbienti(data.ambienti);
  })
  .catch(error => console.error('Errore nel caricamento del JSON:', error));

  // Function to populate the environment menu with options
function popolaMenuAmbienti(ambienti) {
  const ambienteSelect = document.getElementById('ambienteSelect');
  ambienti.forEach(ambiente => {
    const option = document.createElement('option');
    option.value = ambiente.nome;
    option.textContent = ambiente.nome;
    ambienteSelect.appendChild(option);
  });
}

// Function to handle changing the environment
function cambiaAmbiente() {
  const ambienteSelect = document.getElementById('ambienteSelect');
  const setSuoniSelect = document.getElementById('setSuoniSelect');
  const suoniContainer = document.getElementById('suoniContainer');
  
  suoniContainer.innerHTML = ''; // Reset
  setSuoniSelect.style.display = 'none'; // No sound until an environment is selected

  ambienteCorrente = dati.ambienti.find(a => a.nome === ambienteSelect.value);

  if (ambienteCorrente) {
    setSuoniSelect.innerHTML = '<option value="">Select a Sound Set</option>';
    ambienteCorrente.setSuoni.forEach(set => {
      const option = document.createElement('option');
      option.value = set.nome;
      option.textContent = set.nome;
      setSuoniSelect.appendChild(option);
    });
    setSuoniSelect.style.display = 'block'; // Show sound set menu
  }

  cambiaSfondo(ambienteCorrente.sfondo); // Change wallpaper

  if (ambienteCorrente) {
    paddone = ambienteCorrente.soundPad[0];
  }
}


// Updates the current sound set and key-to-sound mapping based on user selection.
function cambiaSetSuoni() {
    const setSuoniSelect = document.getElementById('setSuoniSelect');
    // Find and set the selected sound set
    setCorrente = ambienteCorrente.setSuoni.find(set => set.nome === setSuoniSelect.value);

    if (setCorrente) {
        // Update the key-to-sound mapping
        Object.keys(setCorrente.suoni).forEach(chiave => {
            keyMap[chiave] = setCorrente.suoni[chiave];
        });
    }

    // Remove focus from the selector
    setSuoniSelect.blur();
}


// Updates the audio player's source to the provided URL.
function cambiaSuono(url) {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = url; // Set the new audio source
}

// Changes the webpage background to the specified image URL.
function cambiaSfondo(url) {
    document.body.style.backgroundImage = `url(${url})`; // Set the background image
    document.body.style.backgroundSize = 'cover'; // Ensure the image covers the entire background
    document.body.style.backgroundPosition = 'center'; // Center the background image
    document.body.style.backgroundRepeat = 'no-repeat'; // Prevent the image from repeating
}


  

window.keyMapOctave1 = {
    'A': 'C3',
    'W': 'Csharp3',
    'S': 'D3',
    'E': 'Dsharp3',
    'D': 'E3',
    'F': 'F3',
    'T': 'Fsharp3',
    'G': 'G3',
    'Y': 'Gsharp3',
    'H': 'A3',
    'U': 'Asharp3',
    'J': 'B3',
    'K': 'C4',
    'O': 'Csharp4',
    'L': 'D4',
    'P': 'Dsharp4',
    'Ò': 'E4',
    'À': 'F4'
};

window.keyMapOctave2 = {
    'A': 'C4',
    'W': 'Csharp4',
    'S': 'D4',
    'E': 'Dsharp4',
    'D': 'E4',
    'F': 'F4',
    'T': 'Fsharp4',
    'G': 'G4',
    'Y': 'Gsharp4',
    'H': 'A4',
    'U': 'Asharp4',
    'J': 'B4',
    'K': 'C5',
    'O': 'Csharp5',
    'L': 'D5',
    'P': 'Dsharp5',
    'Ò': 'E5',
    'À': 'F5'
};



// Initialize Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Ensures the AudioContext is ready to function without interruptions
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log("AudioContext started after user interaction.");
        });
    }
});

// Set the default value of the timbre selector to the current sound set
document.getElementById('timbre-select').value = currentSet;



//----------------------- EFFECTS: Flanger, Delay, Distortion, Chorus -----------------------//


// To store the effect nodes for active audio processing effects (initialized as null)
let effectNodes = {
    flanger: null,
    delay: null,
    distortion: null,
    chorus: null 
};

// To track the activation state of each effect (on or off)
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

// Knobs listeners 
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

// To track active sounds for each note
const activeNotes = {};

// Function to play the sound of a note with effects and timbre selection
function playNote(note) {

    // Activates the AudioContext if it is suspended, each time playNote is called
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    // Builds the audio file path based on the current timbre set
    const sound = setCorrente.suoni[note];
    
    const audio = new Audio(sound);
    
    // Creates an audio source in the AudioContext
    const track = audioContext.createMediaElementSource(audio);

    // Applies active effects in the processing chain
    applyActiveEffects(track);

    // Stores the active audio object for this note
    if (!activeNotes[note]) {
        activeNotes[note] = [];
    }

    // Stores the audio instance in the list
    activeNotes[note].push(audio);

    // Connects to the destination (speakers or output device)
    track.connect(audioContext.destination);

    console.log(`Playing note: ${note}, active instances: ${activeNotes[note].length}`);

    // Starts playback
    audio.play().catch(error => console.error("Error loading audio: ", error));

     // Event listener to remove the audio instance once playback ends
     audio.addEventListener('ended', () => {
        const index = activeNotes[note].indexOf(audio);
        if (index > -1) {
            activeNotes[note].splice(index, 1);
        }
        console.log(`Note ${note} ended, audio removed. Remaining instances: ${activeNotes[note].length}`);
    });
}



// Function to apply active effects in a chain
function applyActiveEffects(track) {
    let lastNode = track;// Start with the input track as the first node in the chain

    // Flanger
    if (activeEffects.flanger) {// Check if the flanger effect is active
        if (!effectNodes.flanger) {  // If the flanger node doesn't exist, create it
            effectNodes.flanger = createFlanger(flangerKnob.value);
        }
        lastNode.connect(effectNodes.flanger);// Connect the previous node to the flanger
        lastNode = effectNodes.flanger;// Update the last node to the flanger
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

    // Connect the final node to the audio destination
    lastNode.connect(audioContext.destination);
}


// Handling effect buttons and LEDs
document.getElementById('flanger-btn').addEventListener('click', () => {
    toggleEffect('flanger');// Toggle the flanger effect when its button is clicked
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


// Function to activate or deactivate an effect
function toggleEffect(effect) {
    activeEffects[effect] = !activeEffects[effect];  // Toggle the state of the effect (on/off)
    if (activeEffects[effect]) {
        // If the effect is active, create the corresponding effect node
        effectNodes[effect] = createEffectNode(effect);// Create the node using a function specific to the effect
    } else {
        // If the effect is inactive, disconnect its node
        if (effectNodes[effect]) {
            effectNodes[effect].disconnect();// Disconnect the node from the audio graph
            effectNodes[effect] = null;  // Reset the node for this effect to null
        }
    }
    updateLEDs(); // Update the LEDs to reflect the current state of effects
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

// Function to update the LEDs
function updateLEDs() {
    // Set the background color of each LED based on the state of the corresponding effect
    flangerLed.style.backgroundColor = activeEffects.flanger ? 'green' : 'red';
    delayLed.style.backgroundColor = activeEffects.delay ? 'green' : 'red';
    distortionLed.style.backgroundColor = activeEffects.distortion ? 'green' : 'red';
    chorusLed.style.backgroundColor = activeEffects.chorus ? 'green' : 'red';
}


// Update the state of the LEDs based on active effects
function updateLEDs() {
    // Add or remove the 'active' class for each LED based on the effect's state
    flangerLed.classList.toggle('active', activeEffects.flanger);
    delayLed.classList.toggle('active', activeEffects.delay);
    distortionLed.classList.toggle('active', activeEffects.distortion);
    chorusLed.classList.toggle('active', activeEffects.chorus); 
}


//--------------------------- Functions to create effects using knobs-----------------------
// Function to create the Flanger effect
function createFlanger(rate) {
    const delay = audioContext.createDelay();
    const osc = audioContext.createOscillator();// Create an oscillator for modulation
    const gain = audioContext.createGain();// Create a gain node for modulation depth

    delay.delayTime.value = 0.005;
    osc.frequency.value = rate; // Use the knob value for the oscillator frequency
    gain.gain.value = 0.002;

    osc.connect(gain); // Connect oscillator output to gain
    gain.connect(delay.delayTime);// Modulate the delay time with the gain
    osc.start();

    return delay;
}

// Function to create the Delay effect
function createDelay(time) {
    const delay = audioContext.createDelay();
    delay.delayTime.value = time;  // Use the knob value for the delay time

    const feedback = audioContext.createGain();
    feedback.gain.value = 0.5;

    delay.connect(feedback);// Use the knob value for the delay time
    feedback.connect(delay);// Connect feedback back into the delay for looping

    return delay;
}

// Function to create the Distortion effect
function createDistortion(amount) {
    const distortion = audioContext.createWaveShaper();// Create a wave shaper node
    distortion.curve = makeDistortionCurve(amount);  // Generate a curve based on the knob value
    distortion.oversample = '4x';// Set oversampling for smoother sound
    return distortion;
}

// Function to generate a distortion curve
function makeDistortionCurve(amount) {
    const n_samples = 44100;// Number of samples for the curve
    const curve = new Float32Array(n_samples);// Create an array to hold the curve
    const deg = Math.PI / 180;// Conversion factor for degrees to radians
    for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        // Generate a distortion curve with reduced aggression
        curve[i] = ((3 + (amount * 0.5)) * x * 20 * deg) / (Math.PI + (amount * 0.5) * Math.abs(x));
    }
    return curve;
}

// Function to create the Chorus effect
function createChorus(depth) {
    const delay = audioContext.createDelay();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    // Set a slight base delay time to simulate chorus
    delay.delayTime.value = 0.04;  

    // Set the LFO frequency for modulation
    lfo.frequency.value = 0.6;  
    lfoGain.gain.value = depth * 0.003;  // Profondità della modulazione (usando il valore del knob)

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime); // Modulate delay time with LFO output

    lfo.start();

    return delay; 
}



// ---------------------------------------- KEYBOARD: Event Listener Setup ---------------------------------------------------



// Initially, set the keyMap to the first octave
let keyMap = keyMapOctave1;
let pressedKeys = {};// Object to track the currently pressed keys


updateKeyLabels();// Update the key labels on the keyboard to reflect the current octave


// Function to switch between octaves
document.getElementById('switch-octave').addEventListener('click', () => {
    pressedKeys = {}; // Reset the state of pressed keys when switching octaves
    if (currentOctave === 3) {
        keyMap = keyMapOctave2; // Switch to the second octave
        currentOctave = 4;
    } else {
        keyMap = keyMapOctave1;  // Switch back to the first octave
        currentOctave = 3;
    }
    updateKeyLabels(); // Update the labels on the keyboard to reflect the new octave
});


// Updates the labels of keyboard keys based on the current octave mapping
function updateKeyLabels() {
    document.querySelectorAll('.tasto, .tasto-nero').forEach((key) => {
        const dataKey = key.getAttribute('data-key').toUpperCase();
        const note = keyMap[dataKey];
        
        if (note) {
            key.setAttribute('data-note', note);

            // Display the note only on white keys
            if (key.classList.contains('tasto')) {
                key.textContent = note;
            } else {
                key.textContent = ''; // Keep black keys empty
            }
        } else {
            // If the key is not mapped in the current octave, clear its attributes and content
            key.removeAttribute('data-note');
            key.textContent = '';
        }
    });
}



// Stops the sound of a specific note, managing multiple active instances if necessary
function stopNote(note) {
    if (activeNotes[note] && activeNotes[note].length > 0) {
        console.log(`Stop note: ${note}, active issues: ${activeNotes[note].length}`);

        // Stops only one instance at a time
        const audio = activeNotes[note].shift(); // Remove the first instance from the array
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        // If the array is empty, remove the key from activeNotes
        if (activeNotes[note].length === 0) {
            delete activeNotes[note];
        }
    } else {
        console.warn(`Not found Note ${note} or already stopped.`);
    }
}


// Activates a note (via keyboard or mouse), plays the sound, highlights the key, and handles visual and recording logic.
function activateNote(note, source, startTime = performance.now()) {
    if (!note || pressedKeys[note]) return;// Exit if the note is invalid or already pressed

    playNote(note); // Play the sound of the note
    highlightKey(note);// Highlight the key visually
    pressedKeys[note] = true;// Mark the note as pressed

    console.log(`Note activated by ${source}: ${note}`);

      // Initialize the rectangle for the active note
    activeRectangles[note] = {
        note: note,
        x: timeBarX, // Initial horizontal position based on timeBarX
        y: getYPositionForNote(note), // Calculate the vertical position based on the note
        width: 0, 
        startTime: startTime
    };

     // Draw all active rectangles on the canvas
    for (let key in activeRectangles) {
        drawActiveRectangle(activeRectangles[key]);
    }

    // If a track is actively recording, save the note event
    if (activeTrackIndex !== -1 && tracks[activeTrackIndex].isRecording) {
        const noteData = {
            note: note,
            startTime: startTime,
            duration: null // Duration will be calculated when the note is released
        };

         // Append the note data to the audio data of the active track
        tracks[activeTrackIndex].audioData.push(noteData);
        console.log(`Recorded note ${note} on track ${activeTrackIndex + 1}`, noteData);
    }

    // Start updating the rectangle's visual representation
    requestAnimationFrame(() => updateRectangle(note));
}


/// Handle key press events from the keyboard
document.addEventListener('keydown', function(event) {
    const dataKey = event.key.toUpperCase(); // Get the pressed key and convert it to uppercase
    const note = keyMap[dataKey]; // Map the key to a note using the keyMap
    if (note) {
        activateNote(note, "keyboard"); // Activate the note if it exists in the keyMap
    }
});

// Handle key release events from the keyboard
document.addEventListener('keyup', function(event) {
    const dataKey = event.key.toUpperCase(); // Get the released key and convert it to uppercase
    const note = keyMap[dataKey]; // Map the key to a note using the keyMap
    if (note) {
        unhighlightKey(note); // Remove the visual highlight from the key
        stopNote(note); // Stop the sound of the note
        pressedKeys[note] = false; // Mark the note as no longer pressed

        // Fix the final width and add the rectangle to `playedNotes`
        const rectangle = activeRectangles[note];
        if (rectangle) {
            playedNotes.push({
                note: rectangle.note, // Note name
                x: rectangle.x, // Starting X position
                y: rectangle.y, // Vertical position
                width: rectangle.width, // Final width of the rectangle
                height: 10, // Height of the rectangle
                color: noteColors[rectangle.note] || "black" // Color for the note
            });

            // Draw the fixed note on the staff
            drawFixedNoteOnStaff(
                rectangle.note,
                rectangle.x,
                rectangle.y,
                rectangle.width,
                10,
                noteColors[rectangle.note] || "black"
            );

            // Remove the rectangle from the `activeRectangles` object
            delete activeRectangles[note];
        }

        // Update the note's duration in the active track (if any)
        if (activeTrackIndex !== -1 && tracks[activeTrackIndex].isRecording) {
            const track = tracks[activeTrackIndex];
            const noteEvent = track.audioData.find(
                (n) => n.note === note && n.duration === null // Find the active note event with no duration
            );
            if (noteEvent) {
                noteEvent.duration = performance.now() - noteEvent.startTime; // Calculate the note's duration
                console.log(
                    `Released note ${note}, duration: ${noteEvent.duration}ms on track ${activeTrackIndex + 1}`
                );
            }
        }
    }
});

// Add listeners for clicks on the piano keys
const keys = document.querySelectorAll('.tasto, .tasto-nero'); // Select both the white and black keys
keys.forEach(key => {
    key.addEventListener('mousedown', function(event) {
        event.stopPropagation(); // Prevent the click from propagating to the canvas
        const note = this.getAttribute('data-note');
        if (note) {
            activateNote(note, "mouse"); // Activate the note when clicked with the mouse
        }
    });

    key.addEventListener('mouseup', function() {
        const note = this.getAttribute('data-note');
        if (note) {
            unhighlightKey(note); // Remove the visual highlight from the key
            stopNote(note); // Stop the note sound
            pressedKeys[note] = false; // Mark the key as released

            // Fix the final width and add the rectangle to `playedNotes`
            const rectangle = activeRectangles[note];
            if (rectangle) {
                playedNotes.push({
                    note: rectangle.note, // Note identifier
                    x: rectangle.x, // Starting X position
                    y: rectangle.y, // Vertical position
                    width: rectangle.width, // Final rectangle width
                    height: 10, // Rectangle height
                    color: noteColors[rectangle.note] || "black" // Rectangle color, defaulting to black
                });

                // Draw the fixed note on the staff
                drawFixedNoteOnStaff(
                    rectangle.note,
                    rectangle.x,
                    rectangle.y,
                    rectangle.width,
                    10,
                    noteColors[rectangle.note] || "black"
                );

                // Remove the rectangle from the `activeRectangles` object
                delete activeRectangles[note];
            }

            // Update the note's duration in the active track (if any)
            if (activeTrackIndex !== -1 && tracks[activeTrackIndex].isRecording) {
                const track = tracks[activeTrackIndex];
                const noteEvent = track.audioData.find((n) => n.note === note && n.duration === null);
                if (noteEvent) {
                    noteEvent.duration = performance.now() - noteEvent.startTime;
                    console.log(`Released note ${note}, duration: ${noteEvent.duration}ms on track ${activeTrackIndex + 1}`);
                }
            }
        }
    });

    key.addEventListener('mouseleave', function() {
        const note = this.getAttribute('data-note');
        if (note) {
            unhighlightKey(note); // Remove the visual highlight if the mouse leaves the key
            stopNote(note); // Stop the note sound
            pressedKeys[note] = false; // Mark the key as released

            // If the mouse leaves the key, finalize the active rectangle
            const rectangle = activeRectangles[note];
            if (rectangle) {
                playedNotes.push({
                    note: rectangle.note, // Note identifier
                    x: rectangle.x, // Starting X position
                    y: rectangle.y, // Vertical position
                    width: rectangle.width, // Final rectangle width
                    height: 10, // Rectangle height
                    color: noteColors[rectangle.note] || "black" // Rectangle color, defaulting to black
                });

                // Draw the finalized note on the staff
                drawFixedNoteOnStaff(
                    rectangle.note,
                    rectangle.x,
                    rectangle.y,
                    rectangle.width,
                    10,
                    noteColors[rectangle.note] || "black"
                );

                // Remove the rectangle from the `activeRectangles` object
                delete activeRectangles[note];
            }
        }
    });
});


// Function to visually highlight a key when activated
function highlightKey(note) {
    const tasto = document.querySelector(`[data-note="${note}"]`);
    if (tasto) {
        tasto.classList.add('active'); // Add the "active" class for visual feedback
        
        // Display "#" instead of "sharp" on black keys when pressed
        if (tasto.classList.contains('tasto-nero')) {
            const noteLabel = note.replace("sharp", "#"); // Replace "sharp" with "#"
            tasto.textContent = noteLabel;
        }
    }
}


// Function to remove the visual highlight from a key
function unhighlightKey(note) {
    const tasto = document.querySelector(`[data-note="${note}"]`);
    if (tasto) {
        tasto.classList.remove('active'); // Remove the "active" class
        
        // Clear the text on black keys when released
        if (tasto.classList.contains('tasto-nero')) {
            tasto.textContent = '';
        }
    }
}




// TIMBRE SELECTOR
document.getElementById('timbre-select').addEventListener('change', function() {
    currentSet = parseInt(this.value);  // Update the current sound set

    // Reset the octave to the third
    keyMap = keyMapOctave1;  // Set the key mapping to the first octave
    currentOctave = 3;       // Set the current octave to 3
    updateKeyLabels();       // Update the note labels on the keyboard
});





// ----------------------  PAD: premible with keys 1 to 9 or with the mouse in the GUI   ----------------------

// Map to track the state of pressed pad keys
let pressedPads = {};

// Select all pad keys
const pads = document.querySelectorAll('.pad');


// Activates a PAD note (via keyboard or mouse), plays the sound, highlights the key, and handles visual and recording logic.
pads.forEach(pad => {
    // Add an event listener for the mousedown event on each pad
    pad.addEventListener('mousedown', () => {
        const key = pad.getAttribute('data-key'); // Retrieve the key identifier for the pad
        
        // Check if the pad key is not already pressed
        if (!pressedPads[key]) {
            const number = parseInt(pad.textContent.trim()); // Extract the number displayed on the pad
            playPadSound(pad); // Play the sound associated with the pad
            pad.classList.add('key-active'); // Add a class to visually highlight the pad
            pad.classList.add('active-text'); // Add another class for active text styling
            pressedPads[key] = true; // Mark the pad as pressed in the tracking map
    
            // Update the canvas with the pad's number, position, and color
            if (number >= 1 && number <= 9) { // Only process numbers in the valid range
                const x = metronomePlaying ? timeBarX : lastBarX; // Determine the X position based on the metronome state
                let color = "black"; // Default color is black
    
                activeNumbersWithPositions.push({ number, x, color }); // Save the pad number with its position and color
                drawAllNumbers(); // Redraw all active numbers on the canvas
            }
    
            // Handle global recording logic
            if (isGlobalRecording && activeTrackIndex !== -1) { // Check if recording is active and a track is selected
                console.log(`Recording active on track ${activeTrackIndex + 1}`); // Log the active track
                const track = tracks[activeTrackIndex];
                const startTime = performance.now(); // Capture the note's start time
    
                // Save the audio data and pad details to the current track
                track.audioData.push({
                    note: pad.getAttribute('data-sound'), // Get the name of the pad's associated sound file
                    startTime    // Store the start time of the note
                });
    
                console.log(`Recorded pad sound (${pad.getAttribute('data-sound')}) on track ${activeTrackIndex + 1}`); // Log the recording
            } else {
                console.log("Recording not active or no track selected."); // Log if recording is inactive
            }
        }
    });



    // Add an event listener for the mouseup event on each pad
pad.addEventListener('mouseup', () => {
    const key = pad.getAttribute('data-key'); // Retrieve the key identifier for the pad
    pad.classList.remove('key-active'); // Remove the visual highlight from the pad
    pad.classList.remove('active-text'); // Remove the active text styling from the pad
    pressedPads[key] = false; // Mark the pad as no longer pressed in the tracking map
});

// Add an event listener for the mouseleave event on each pad
pad.addEventListener('mouseleave', () => {
    const key = pad.getAttribute('data-key'); // Retrieve the key identifier for the pad
    pad.classList.remove('key-active'); // Remove the visual highlight from the pad
    pad.classList.remove('active-text'); // Remove the active text styling from the pad
    pressedPads[key] = false; // Mark the pad as no longer pressed in the tracking map
});

});


// Handle keyboard keydown events
document.addEventListener('keydown', (e) => {
    const key = e.keyCode; // Get the keycode of the pressed key
    const pad = document.querySelector(`.pad[data-key="${key}"]`); // Find the corresponding pad by data-key attribute
    if (pad && !pressedPads[key]) { // Check if the pad exists and is not already pressed
        playPadSound(pad); // Play the sound associated with the pad
        pad.classList.add('key-active'); // Add a visual highlight to the pad
        pad.classList.add('active-text'); // Add a text-active style to the pad
        pressedPads[key] = true; // Mark the pad as pressed in the tracking map

        const number = parseInt(pad.textContent.trim()); // Get the number displayed on the pad

        // Draw the number associated with the pad on the main canvas
        if (number >= 1 && number <= 9) { // Only handle numbers within the valid range
            const x = metronomePlaying ? timeBarX : lastBarX; // Use the current position on the canvas
            let color = "black"; // Default color is black

            // Change the color only if the metronome is stopped
            if (!metronomePlaying && activeNumbersWithPositions.some(n => n.number === number)) {
                color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Generate a random color
            }

            // Save the number with its position and color to the active list
            activeNumbersWithPositions.push({ number, x, color }); 
            drawAllNumbers(); // Redraw all numbers on the canvas
        }

        // Recording logic
        if (isGlobalRecording && activeTrackIndex !== -1) { // Check if global recording is active and a track is selected
            console.log(`Recording active on track ${activeTrackIndex + 1}`);
            const track = tracks[activeTrackIndex];
            const startTime = performance.now(); // Capture the start time of the note

            // Save audio data for the pad during recording
            track.audioData.push({
                note: pad.getAttribute('data-sound'), // Get the sound file name for the pad
                startTime // Store the start time of the note
            });

            console.log(`Recorded pad sound (${pad.getAttribute('data-sound')}) on track ${activeTrackIndex + 1}`);
        } else {
            console.log("Recording not active or no track selected."); // Log if no recording is active
        }
    }
});


// Handle keyboard keyup events
document.addEventListener('keyup', (e) => {
    const key = e.keyCode; // Get the keycode of the released key
    const pad = document.querySelector(`.pad[data-key="${key}"]`); // Find the corresponding pad by data-key attribute
    if (pad) { // Check if the pad exists
        pad.classList.remove('key-active'); // Remove the visual highlight from the pad
        pad.classList.remove('active-text'); // Remove the active text style from the pad
        pressedPads[key] = false; // Mark the pad as no longer pressed in the tracking map
    }
});




// Function to play pad sounds
function playPadSound(pad) {
    const key = pad.getAttribute('data-sound'); // Get the sound identifier from the pad
    const sound = paddone[`suono${key}`]; // Retrieve the corresponding sound from the paddone object
    
    if (sound) {
        const audio = new Audio(sound); // Create a new audio instance for the sound
        audio.play().catch(error => console.error("Error loading PAD audio:", error)); // Play the sound or log an error if it fails
    } else {
        console.warn(`No sound found for pad key ${key}`); // Warn if no sound is mapped to the key
    }
}



// ----------------------- Pentagram and Time Bar:
// The Time Bar moves across the canvas at the speed chosen by the user-modifiable bpm and time signature. 
// It changes colour if it is in the vicinity of an accent. 
//The Pentagram as if it were a piano roll, not with traditional notes so that even those who don't know them can play by understanding. -----------------------------


const canvas = document.getElementById('staffCanvas'); // Get the canvas element for the staff
const ctx = canvas.getContext('2d'); // Get the 2D drawing context for the canvas
let currentXPosition = 0; // Tracks the current X position for drawing notes
let timeBarX = 0; // Tracks the current X position of the time bar
let isPlaying = false; // Tracks whether the playback is active
let timeBarIntervalId; // Identifier for the time bar interval timer
let metronomeIntervalId; // Identifier for the metronome interval timer
let bpm = 120; // Default beats per minute (BPM)
let beatDuration = 60000 / bpm; // Duration of one beat in milliseconds, calculated from BPM
let numberOfBars = 4; // Default number of bars
let beatsPerBar = 4; // Number of beats per bar, modifiable with `let`
let barWidth = 200; // Width of each bar in the staff
let staffLength = numberOfBars * barWidth; // Total length of the staff in pixels
let beatCount = 0; // Counter for the beats
let isTimeBarActive = false; // Tracks whether the time bar is active
const metronomeAccentFrequency = 800; // Frequency for the metronome's accented click (e.g., first beat)
const metronomeClickFrequency = 500; // Frequency for the regular metronome click
let metronomeMuted = false; // Tracks whether the metronome is muted
let metronomePlaying = false; // Tracks whether the metronome is currently playing

// Set the canvas width based on the total length of the staff
canvas.width = staffLength;

// Input element for adjusting the BPM
const bpmInput = document.getElementById('bpm'); // Assume an HTML input element with id 'bpm'
bpmInput.addEventListener('input', function() {
    bpm = parseInt(this.value); // Parse the input value as an integer
    beatDuration = 60000 / bpm; // Update the beat duration based on the new BPM
    if (metronomePlaying) {
        clearInterval(metronomeIntervalId); // Stop the previous metronome interval
        startMetronome(); // Restart the metronome with the updated BPM
    }
});

// Input element for adjusting the number of bars
const barsInput = document.getElementById('bars'); // Assume an HTML input element with id 'bars'
barsInput.addEventListener('input', function() {
    numberOfBars = parseInt(this.value); // Parse the input value as an integer
    staffLength = numberOfBars * barWidth; // Recalculate the total staff length
    canvas.width = staffLength; // Update the canvas width to match the new staff length
    currentXPosition = 0; // Reset the current X position for drawing notes
    timeBarX = 0; // Reset the time bar position
});



let playedNotes = [];  // Array to store the notes that have already been played
let performanceStartTime = performance.now();  // The time when the performance begins
let lastNoteTime = performanceStartTime;  // Time of the last note played
let totalBeats = numberOfBars * beatsPerBar;  // Total number of beats in the composition
const barWidthPerBeat = canvas.width / totalBeats; // The number of pixels allocated for each beat on the canvas


// Variable to track the start times of key presses
let keyDownTimes = {};
let activeRectangles = {};  // Object to store active rectangles and their press times
let canvasReset = false;  // New variable to track whether the canvas has been reset



// Map of colors assigned to each note
const noteColors = {
    "C3": "#FF5733", "Csharp3": "#C70039", "D3": "#900C3F", "Dsharp3": "#581845", "E3": "#FF33FF",
    "F3": "#33FF57", "Fsharp3": "#33FFF3", "G3": "#33AFFF", "Gsharp3": "#5733FF", "A3": "#FF335E",
    "Asharp3": "#FF9133", "B3": "#33FF8E", "C4": "#A633FF", "Csharp4": "#D433FF", "D4": "#FF33D4",
    "Dsharp4": "#FF33A6", "E4": "#FF3384", "F4": "#FF3367", "Fsharp4": "#FF3350", "G4": "#FF5733",
    "Gsharp4": "#FF6F33", "A4": "#FF8C33", "Asharp4": "#FFB833", "B4": "#FFDA33", "C5": "#FFE733",
    "Csharp5": "#D4FF33", "D5": "#A6FF33", "Dsharp5": "#84FF33", "E5": "#67FF33", "F5": "#50FF33"
};


// Function to get the vertical position of a note (updated for two octaves)
function getYPositionForNote(note) {
    const positions = {
        "C3": 378, "Csharp3": 365, "D3": 352, "Dsharp3": 339, "E3": 326,
        "F3": 313, "Fsharp3": 300, "G3": 287, "Gsharp3": 274, "A3": 261,
        "Asharp3": 248, "B3": 235, "C4": 222, "Csharp4": 209, "D4": 196,
        "Dsharp4": 183, "E4": 170, "F4": 157, "Fsharp4": 144, "G4": 131,
        "Gsharp4": 118, "A4": 105, "Asharp4": 92, "B4": 79, "C5": 66,
        "Csharp5": 53, "D5": 40, "Dsharp5": 27, "E5": 14, "F5": 1
    };

    return positions[note]; // Return the Y position of the given note
}



// Disegna il rettangolo attivo che si allarga dinamicamente
function drawActiveRectangle(rectangle) {
    ctx.fillStyle = noteColors[rectangle.note] || "black";
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, 10);  // Usa la posizione x dinamica
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    let displayNote = rectangle.note.includes("sharp") ? rectangle.note.replace("sharp", "#") : rectangle.note;
    ctx.fillText(displayNote, rectangle.x + rectangle.width + 5, rectangle.y - 5);
}

// Disegna una nota fissata sul pentagramma
function drawFixedNoteOnStaff(note, x, y, width, height, color, noLabel = false) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Disegna la label solo se noLabel è false
    if (!noLabel) {
        ctx.fillStyle = "black";
        ctx.font = "17px Arial";
        let displayNote = note.includes("sharp") ? note.replace("sharp", "#") : note;
        ctx.fillText(displayNote, x + width + 10, y + height / 2 + 1);
    }
}




// Funzione per aggiornare la larghezza del rettangolo attivo mentre il tasto è premuto
// Sincronizzazione della larghezza dei rettangoli con il BPM
function updateRectangle(dataKey) {
    if (!activeRectangles[dataKey]) return; // Esci se il rettangolo non è più attivo

    const rectangle = activeRectangles[dataKey];
    const currentTime = performance.now();
    const duration = (currentTime - rectangle.startTime) / 1000; // Durata in secondi

    // Calcola la larghezza basata sul BPM
    const pixelsPerSecond = canvas.width / (beatDuration * beatsPerBar / 1000); // Pixel al secondo
    rectangle.width = duration * pixelsPerSecond / 4 ;

    // Gestione ciclica delle battute
    const maxX = staffLength; // Lunghezza totale del canvas
    if (rectangle.x + rectangle.width > maxX) {
        rectangle.width = maxX - rectangle.x; // Adatta la larghezza alla fine del canvas
        const overflowWidth = duration * pixelsPerSecond / 4 - rectangle.width;

        if (overflowWidth > 0) {
            // Aggiungi la parte "spezzata" senza label
            playedNotes.push({
                note: rectangle.note,
                x: 0, // Riparte da inizio canvas
                y: rectangle.y,
                width: overflowWidth,
                height: 10,
                color: noteColors[rectangle.note] || "black",
                noLabel: true // Flag per evitare di disegnare la label
            });
        }
    }

    // Ridisegna il canvas
    clearStaff();
    drawTimeBar(); // Ridisegna la barra del tempo
    redrawNotes(); // Ridisegna le note fissate
    for (let key in activeRectangles) {
        drawActiveRectangle(activeRectangles[key]); // Disegna i rettangoli attivi
    }
    drawAllNumbers(); // Ridisegna i numeri

    // Continua l'aggiornamento finché il tasto è premuto
    requestAnimationFrame(() => updateRectangle(dataKey));
}



// Ridisegna tutte le note fissate già suonate
function redrawNotes() {
    playedNotes.forEach(note => {
        drawFixedNoteOnStaff(
            note.note,
            note.x,
            note.y,
            note.width,
            note.height,
            note.color,
            note.noLabel || false // Passa il flag per disegnare o meno la label
        );
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
bpmInput.addEventListener('input', function() {
    bpm = parseInt(this.value);
    beatDuration = 60000 / bpm;  // Aggiorna la durata del battito

    // Ferma il metronomo e la barra se sono attivi
    if (metronomePlaying) {
        clearInterval(metronomeIntervalId);
        stopTimeBar();  // Ferma la barra
        startMetronome();  // Riavvia il metronomo con il nuovo BPM
    }
});




// -------------------- Controllo Barra del Tempo --------------------


// Funzione per disegnare la barra del tempo

function drawTimeBar() {
    ctx.lineWidth = 4; // Imposta la larghezza della linea
    ctx.beginPath();

    // Usa timeBarX se la barra è attiva, altrimenti lastBarX
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

        // Sincronizza il tempo di partenza con il metronomo
        const elapsedFromLastStop = (lastBarX / barWidth) * beatDuration * beatsPerBar;
        performanceStartTime = performance.now() - elapsedFromLastStop;

        timeBarX = lastBarX;
        beatCount = 0; // Reset del conteggio dei battiti
        requestAnimationFrame(animateTimeBar);
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
        lastBarX = 0;   // Resetta anche la posizione salvata
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
function finalizeRecording(trackIndex) {
    const track = tracks[trackIndex];
    const preRollOffset = preRollBars * beatsPerBar * beatDuration; // Durata del Pre-Roll in ms

    if (!track.audioData.length) {
        console.warn(`Nessuna nota registrata sulla traccia ${trackIndex + 1}`);
        return;
    }

    // Normalizza i tempi delle note per rimuovere il Pre-Roll
    track.audioData = track.audioData.map(noteData => ({
        ...noteData,
        startTime: noteData.startTime - track.recordStartTime - preRollOffset
    })).filter(noteData => noteData.startTime >= 0); // Elimina eventuali note che iniziano nel Pre-Roll

    console.log(`Registrazione confermata sulla traccia ${trackIndex + 1}, Pre-Roll rimosso`);
}



// Creiamo i GainNode per ogni traccia
tracks.forEach((track, index) => {
    track.gainNode = audioContext.createGain(); // Creazione del GainNode
    track.gainNode.gain.value = 1; // Volume iniziale (100%)
    track.gainNode.connect(audioContext.destination); // Collegamento alla destinazione
});


// Funzione per aggiornare il volume di una traccia
function updateVolume(trackIndex, volume) {
    if (trackIndex >= 0 && trackIndex < tracks.length) {
        const track = tracks[trackIndex];
        track.gainNode.gain.value = volume; // Aggiorna il valore di guadagno
        console.log(`Volume della traccia ${trackIndex + 1} aggiornato a ${volume}`);
    }
}


// Funzione per riprodurre una traccia con il controllo del volume
function playTrack(trackIndex) {
    const track = tracks[trackIndex];
    if (!track.audioData.length) {
        console.log(`Nessuna nota registrata sulla traccia ${trackIndex + 1}`);
        return;
    }

    const globalStartTime = performance.now(); // Tempo di avvio globale

    console.log(`Riproduzione della traccia ${trackIndex + 1}`);

    track.audioData.forEach(noteData => {
        const notePlaybackTime = globalStartTime + (noteData.startTime - track.recordStartTime);
        const delay = notePlaybackTime - performance.now();

        if (delay >= 0) {
            setTimeout(() => {
                const audioPath = Number.isInteger(Number(noteData.note)) && Number(noteData.note) >= 1 && Number(noteData.note) <= 9
                    ? `sounds/sounds/${ambienteCorrente.nome}/Pad/suono${noteData.note}.mp3`
                    : `sounds/sounds/${ambienteCorrente.nome}/Timbre${setCorrente?.nome.split(' ')[1] || 1}/${noteData.note}.mp3`;

                const audio = new Audio(audioPath);
                const trackSource = audioContext.createMediaElementSource(audio);
                trackSource.connect(track.gainNode);

                audio.play().catch(error => console.error("Errore nel caricamento dell'audio: ", error));

                if (noteData.duration) {
                    setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0;
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

// Collegamento degli slider al controllo del volume
document.querySelectorAll('.volume-slider').forEach((slider) => {
    slider.addEventListener('input', () => {
        const trackIndex = parseInt(slider.dataset.track) - 1; // Ottieni l'indice della traccia
        const value = parseFloat(slider.value); // Valore tra 0 e 1
        updateVolume(trackIndex, value); // Aggiorna il volume
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
    downloadAllTracks();
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
    const rectWidth = 35; // Larghezza del rettangolo
    const rectHeight = 30; // Altezza del rettangolo
    const cornerRadius = 5; // Raggio degli angoli arrotondati

    // Disegna il rettangolo nero con angoli smussati
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y - rectHeight / 2);
    ctx.lineTo(x + rectWidth - cornerRadius, y - rectHeight / 2);
    ctx.arcTo(x + rectWidth, y - rectHeight / 2, x + rectWidth, y - rectHeight / 2 + cornerRadius, cornerRadius);
    ctx.lineTo(x + rectWidth, y + rectHeight / 2 - cornerRadius);
    ctx.arcTo(x + rectWidth, y + rectHeight / 2, x + rectWidth - cornerRadius, y + rectHeight / 2, cornerRadius);
    ctx.lineTo(x + cornerRadius, y + rectHeight / 2);
    ctx.arcTo(x, y + rectHeight / 2, x, y + rectHeight / 2 - cornerRadius, cornerRadius);
    ctx.lineTo(x, y - rectHeight / 2 + cornerRadius);
    ctx.arcTo(x, y - rectHeight / 2, x + cornerRadius, y - rectHeight / 2, cornerRadius);
    ctx.closePath();
    ctx.fillStyle = "black"; // Colore del rettangolo
    ctx.fill();

    // Disegna il numero bianco
    ctx.fillStyle = "white"; // Colore del numero
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(number, x + rectWidth / 2, y); // Posiziona il numero al centro del rettangolo
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



//DOWNLOAD 
async function downloadAllTracks() {
    const sampleRate = 44100; // Frequenza di campionamento standard
    let maxDuration = 0; // Durata massima dinamica

    // Calcolo della durata totale delle tracce
    for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        const track = tracks[trackIndex];
        if (!track.audioData.length) {
            console.log(`Traccia ${trackIndex + 1} non contiene dati audio.`);
            continue;
        }

        track.audioData.forEach(noteData => {
            const noteEndTime = (noteData.startTime - track.recordStartTime) + noteData.duration;
            console.log(`Traccia ${trackIndex + 1}, Nota: ${noteData.note}, Fine nota: ${noteEndTime}`);
            if (noteEndTime > maxDuration) {
                maxDuration = noteEndTime; // Aggiorna la durata massima
            }
        });
    }

    // Convertiamo maxDuration in secondi e impostiamo un valore minimo
    maxDuration = Math.max(Math.ceil(maxDuration / 1000), 1); // In secondi, almeno 1 secondo
    console.log(`Durata totale calcolata: ${maxDuration} secondi`);

    // Creazione dell'OfflineAudioContext con la durata dinamica
    const offlineContext = new OfflineAudioContext(2, sampleRate * maxDuration, sampleRate);
    const bufferSources = [];

    // Funzione per caricare i file audio
    async function loadAudio(url) {
        console.log(`Caricamento audio: ${url}`);
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return await offlineContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error(`Errore nel caricamento dell'audio: ${url}`, error);
        }
    }

    // Caricamento e mixaggio di tutte le tracce
    for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        const track = tracks[trackIndex];
        if (!track.audioData.length) continue;

        for (const noteData of track.audioData) {
            const audioPath = Number.isInteger(Number(noteData.note)) && Number(noteData.note) >= 1 && Number(noteData.note) <= 9
                ? `sounds/sounds/${ambienteCorrente.nome}/Pad/suono${noteData.note}.mp3` // Percorso per i suoni del PAD
                : `sounds/sounds/${ambienteCorrente.nome}/Timbre${setCorrente?.nome.split(' ')[1] || 1}/${noteData.note}.mp3`; // Percorso per i suoni della tastiera

            const audioBuffer = await loadAudio(audioPath);
            if (!audioBuffer) continue;

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            const startTime = (noteData.startTime - track.recordStartTime) / 1000; // In secondi
            source.connect(offlineContext.destination);
            source.start(startTime);

            bufferSources.push(source);
        }
    }

    console.log('Inizio rendering offline...');
    const renderedBuffer = await offlineContext.startRendering();
    console.log('Rendering completato, conversione in WAV...');

    // Converte il buffer in un file WAV
    const wavBlob = bufferToWav(renderedBuffer);
    const url = URL.createObjectURL(wavBlob);

    // Scarica il file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-tracks.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('Download completato: all-tracks.wav');
}


// Funzione per convertire un AudioBuffer in WAV
function bufferToWav(buffer) {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    let offset = 0;
    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, 36 + buffer.length * numOfChannels * 2, true); offset += 4;
    writeString(view, offset, 'WAVE'); offset += 4;
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numOfChannels, true); offset += 2;
    view.setUint32(offset, buffer.sampleRate, true); offset += 4;
    view.setUint32(offset, buffer.sampleRate * numOfChannels * 2, true); offset += 4;
    view.setUint16(offset, numOfChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, buffer.length * numOfChannels * 2, true); offset += 4;

    const channels = [];
    for (let i = 0; i < numOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let sampleIndex = 0;
    while (sampleIndex < buffer.length) {
        for (let i = 0; i < numOfChannels; i++) {
            const sample = Math.max(-1, Math.min(1, channels[i][sampleIndex]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
        sampleIndex++;
    }

    return new Blob([bufferArray], { type: 'audio/wav' });
}
