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



//-------------------------------- EFFECTS: Flanger, Delay, Distortion, Chorus -----------------------//

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


// Function to create a node for the effect
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



//--------------------------- Functions to create effects using knobs-----------------------------------

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
    // Save note data in the active track
    if (activeTrackIndex !== -1 && tracks[activeTrackIndex].isRecording) {
    const noteData = {
        note: note, // Note name or identifier
        startTime: startTime, // Note start time
        duration: null, // Duration will be calculated when the note is released
        ambiente: ambienteCorrente?.nome || 'default-environment', // Current environment
        timbro: setCorrente?.nome || 'default-timbre' // Current timbre
    };

    // Add the note data to the audio data of the active track
    tracks[activeTrackIndex].audioData.push(noteData);
    console.log(`Note ${note} recorded on track ${activeTrackIndex + 1}`, noteData);
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




//-------------------------------- TIMBRE SELECTOR---------------------------------------------------
document.getElementById('timbre-select').addEventListener('change', function() {
    currentSet = parseInt(this.value);  // Update the current sound set

    // Reset the octave to the third
    keyMap = keyMapOctave1;  // Set the key mapping to the first octave
    currentOctave = 3;       // Set the current octave to 3
    updateKeyLabels();       // Update the note labels on the keyboard
});





// -------------------------------  PAD: premible with keys 1 to 9 or with the mouse in the GUI   ----------------------

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



// --------------------  Pentagram and Time Bar:------------------------------------------------------------------------
// The Time Bar moves across the canvas at the speed chosen by the user-modifiable bpm and time signature. 
// It changes colour if it is in the vicinity of an accent. 
//The Pentagram as if it were a piano roll, not with traditional notes so that even those who don't know them can play by understanding. -------------------- // 


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



//Draw the active rectangle that dynamically expands together with the bar at the preset speed of BPM
function drawActiveRectangle(rectangle) {
    ctx.fillStyle = noteColors[rectangle.note] || "black"; // Set the fill color based on the note, default to black
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, 10); // Draw the rectangle at the specified position with dynamic width
    ctx.fillStyle = "black"; // Reset fill color for the note label
    ctx.font = "30px Arial"; // Set the font for the note label
    let displayNote = rectangle.note.includes("sharp") ? rectangle.note.replace("sharp", "#") : rectangle.note; // Replace "sharp" with "#" for cleaner display
    ctx.fillText(displayNote, rectangle.x + rectangle.width + 5, rectangle.y - 5); // Draw the note label near the rectangle
}


// Draw a fixed note on the staff
function drawFixedNoteOnStaff(note, x, y, width, height, color, noLabel = false) {
    ctx.fillStyle = color; // Set the fill color for the fixed note
    ctx.fillRect(x, y, width, height); // Draw the fixed rectangle on the staff

    // Draw the note label only if noLabel is false
    if (!noLabel) {
        ctx.fillStyle = "black"; // Set the color for the label
        ctx.font = "17px Arial"; // Set the font for the note label
        let displayNote = note.includes("sharp") ? note.replace("sharp", "#") : note; // Replace "sharp" with "#" for the label
        ctx.fillText(displayNote, x + width + 10, y + height / 2 + 1); // Draw the label slightly to the right of the rectangle
    }
}



// Function to update the width of the active rectangle while the key is pressed
// Synchronizes the rectangle's width with the BPM and Time Signature
function updateRectangle(dataKey) {
    if (!activeRectangles[dataKey]) return; // Exit if the rectangle is no longer active

    const rectangle = activeRectangles[dataKey];
    const currentTime = performance.now();
    const duration = (currentTime - rectangle.startTime) / 1000; // Duration in seconds

    // Calculate the width based on the number of bars selected
    const pixelsPerSecond = canvas.width / (beatDuration * beatsPerBar / 1000); // Pixels per second

    switch (numberOfBars) {
        case 4:
            rectangle.width = duration * pixelsPerSecond / 4;
            break;
        case 8:
            rectangle.width = duration * pixelsPerSecond / 8;
            break;
        case 12:
            rectangle.width = duration * pixelsPerSecond / 12;
            break;
        case 16:
            rectangle.width = duration * pixelsPerSecond / 16;
            break;
        default:
            
    }

    const maxX = staffLength; // Total length of the canvas
    if (rectangle.x + rectangle.width > maxX) {
        rectangle.width = maxX - rectangle.x; // Adjust the width to fit the canvas
        const overflowWidth = duration * pixelsPerSecond / numberOfBars - rectangle.width;

        if (overflowWidth > 0) {
            // Add the "wrapped" portion without a label
            playedNotes.push({
                note: rectangle.note,
                x: 0, // Restart from the beginning of the canvas
                y: rectangle.y,
                width: overflowWidth,
                height: 10,
                color: noteColors[rectangle.note] || "black",
                noLabel: true // Flag to avoid drawing the label
            });
        }
    }

    // Redraw the canvas
    clearStaff(); // Clear the staff
    drawTimeBar(); // Redraw the time bar
    redrawNotes(); // Redraw the fixed notes
    for (let key in activeRectangles) {
        drawActiveRectangle(activeRectangles[key]); // Draw the active rectangles
    }
    drawAllNumbers(); // Redraw the numbers

    // Continue updating as long as the key is pressed
    requestAnimationFrame(() => updateRectangle(dataKey));
}



// Redraw all fixed notes that have already been played
function redrawNotes() {
    playedNotes.forEach(note => {
        drawFixedNoteOnStaff(
            note.note, // Note identifier
            note.x, // X position of the note
            note.y, // Y position of the note
            note.width, // Width of the note rectangle
            note.height, // Height of the note rectangle
            note.color, // Color of the note rectangle
            note.noLabel || false // Pass the flag to determine whether to draw the label
        );
    });
}



// Function to clear the staff but preserve notes
function clearStaff(preserveNotes = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    if (preserveNotes) {
        redrawNotes(); // Redraw previously played notes
        drawReferenceBars(); // Redraw static reference bars
    }
}


// Function to clear all notes from the canvas
function clearAllNotes() {
    playedNotes = []; // Empty the array of played notes
    activeNumbersWithPositions = []; // Also clear the numbers
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    drawReferenceBars(); // Redraw the static reference bars

    // Redraw the time bar if the metronome is not active
    if (!isTimeBarActive) {
        drawTimeBar(); // Redraw the time bar at its current position
    }
}


// Add a click event listener to the "Clear Notes" button
document.getElementById('clearNotesButton').addEventListener('click', clearAllNotes);


// Function to draw vertical reference bars in gray
function drawReferenceBars() {
    // Calculate the width of each beat on the canvas
    const beatWidth = canvas.width / (numberOfBars * beatsPerBar);
    ctx.strokeStyle = "gray"; // Set the color for the bars to gray

    // Loop to draw the reference bars
    for (let i = 0; i < numberOfBars * beatsPerBar; i++) {
        const xPosition = i * beatWidth; // Calculate the X position for each bar
        // Increase the width for the first bar of each measure (accented bar)
        ctx.lineWidth = (i % beatsPerBar === 0) ? 3 : 1;

        // Draw the vertical line
        ctx.beginPath();
        ctx.moveTo(xPosition, 0); // Start from the top of the canvas
        ctx.lineTo(xPosition, canvas.height); // Extend to the bottom of the canvas
        ctx.stroke(); // Render the line
    }
}

// Initial drawing of the static reference bars at the start
drawReferenceBars();



// When the number of beats per minute (BPM) changes
bpmInput.addEventListener('input', function() {
    bpm = parseInt(this.value); // Parse the input value as an integer for the new BPM
    beatDuration = 60000 / bpm; // Update the duration of each beat in milliseconds

    // Stop the metronome and the time bar if they are active
    if (metronomePlaying) {
        clearInterval(metronomeIntervalId); // Clear the current metronome interval
        stopTimeBar(); // Stop the time bar animation
        startMetronome(); // Restart the metronome with the updated BPM
    }
});




// -------------------- Focusing on Time Bar -------------------- //

// Function to draw the time bar
function drawTimeBar() {
    ctx.lineWidth = 4; // Set the line width
    ctx.beginPath();

    // Use timeBarX if the bar is active, otherwise use lastBarX
    const roundedX = Math.round(isTimeBarActive ? timeBarX : lastBarX);
    ctx.moveTo(roundedX, 0); // Start the line at the top

    // Set the color of the bar
    ctx.strokeStyle = beatCount % beatsPerBar === 0 ? "green" : "red";

    ctx.lineTo(roundedX, canvas.height); // Draw the line down to the bottom
    ctx.stroke(); // Execute the drawing
}


// Function to start the time bar
function startTimeBar() {
    if (!isTimeBarActive) {
        isTimeBarActive = true;

        // Synchronize the starting time with the metronome
        const elapsedFromLastStop = (lastBarX / barWidth) * beatDuration * beatsPerBar;
        performanceStartTime = performance.now() - elapsedFromLastStop;

        timeBarX = lastBarX;
        beatCount = 0; // Reset the beat count
        requestAnimationFrame(animateTimeBar);
    }
}


// Function to stop the time bar
function stopTimeBar() {
    isTimeBarActive = false; // Stop the bar
    lastBarX = Math.round(timeBarX); // Save the current position accurately
}



// Function to animate the time bar
function animateTimeBar() {
    if (!isTimeBarActive) return; // Exit if the time bar is not active

    clearStaff(); // Clear the staff
    drawTimeBar(); // Redraw the time bar

    // Calculate the real elapsed time
    const currentTime = performance.now();
    const elapsedTime = currentTime - performanceStartTime; // Time elapsed since the performance started

    // Total duration of one bar (in milliseconds)
    const barDuration = beatDuration * beatsPerBar;

    // Calculate the current position within the current bar
    const progressInBar = (elapsedTime % barDuration) / barDuration;

    // Calculate `timeBarX` as a fraction of the bar's width
    timeBarX = progressInBar * barWidth;

    // Calculate how many bars have passed
    const barsElapsed = Math.floor(elapsedTime / barDuration);
    timeBarX += barsElapsed * barWidth;

    // Align the bar's position with the canvas width
    if (timeBarX >= canvas.width) {
        timeBarX %= canvas.width; // Reset to the beginning while continuing smoothly
        beatCount = 0; // Reset the beat count
        performanceStartTime = currentTime; // Synchronize the starting time
    }

    // Update `beatCount` based on `elapsedTime`
    beatCount = Math.floor((elapsedTime / beatDuration) % beatsPerBar);

    drawAllNumbers(); // Redraw the synchronized numbers
    requestAnimationFrame(animateTimeBar); // Continue the animation
}



// -------------------- Tempo Bar and Metronome Control Synchronisation -------------------- //
const startMetronomeButton = document.getElementById('startMetronomeButton'); // Get the button to start the metronome
const stopMetronomeButton = document.getElementById('stopMetronomeButton'); // Get the button to stop the metronome
const muteMetronomeButton = document.getElementById('muteMetronomeButton'); // Get the button to mute the metronome

startMetronomeButton.addEventListener('click', startMetronome); // Add a click event listener to start the metronome
stopMetronomeButton.addEventListener('click', stopMetronome); // Add a click event listener to stop the metronome
muteMetronomeButton.addEventListener('click', toggleMetronomeMute); // Add a click event listener to mute/unmute the metronome


// Function to toggle the mute state of the metronome
function toggleMetronomeMute() {
    metronomeMuted = !metronomeMuted; // Toggle the mute state (true -> false, false -> true)
    muteMetronomeButton.innerText = metronomeMuted ? "Unmute Metronome" : "Mute Metronome"; // Update the button text based on the mute state
}


// Function to start the metronome
function startMetronome() {
    if (!metronomePlaying) { // Only proceed if the metronome is not already playing

        metronomePlaying = true; // Set the metronome state to playing
        beatCount = 0; // Reset the beat counter to the start
        timeBarX = 0; // Reset the time bar position to the beginning
        lastBarX = 0; // Reset the saved time bar position
        performanceStartTime = performance.now(); // Record the current time to synchronize the metronome and time bar

        // Draw the time bar at position 0 immediately
        clearStaff(); // Clear the staff
        drawTimeBar(); // Draw the initial time bar at the start

        // Play the first accented beat immediately
        playMetronomeAccent();

        // Start the metronome and synchronize it with the time bar
        metronomeIntervalId = setInterval(() => {
            beatCount = (beatCount + 1) % (beatsPerBar * numberOfBars); // Increment the beat count, resetting after all bars are completed

            // Play the metronome sound
            if (beatCount % beatsPerBar === 0) { // If it's the first beat of a bar
                playMetronomeAccent(); // Play the accented metronome sound
                // timeBarX = 0; // Optionally reset the time bar to the start of the bar (commented out)
            } else {
                playMetronomeClick(); // Play the regular metronome click
            }
        }, beatDuration); // Set the interval to match the duration of one beat

        // Also start the time bar animation
        startTimeBar();
    }
}


// Function to stop the metronome
function stopMetronome() {
    clearInterval(metronomeIntervalId); // Clear the interval to stop the metronome
    metronomePlaying = false; // Set the metronome state to stopped
    stopTimeBar(); // Stop the time bar animation
}


// Function for the regular metronome click
function playMetronomeClick() {

    if (metronomeMuted) return; // Exit immediately if the metronome is muted

    const oscillator = audioContext.createOscillator(); // Create an oscillator for the sound
    const gainNode = audioContext.createGain(); // Create a gain node to control the volume

    oscillator.type = 'square'; // Set the oscillator wave type to square
    oscillator.frequency.setValueAtTime(metronomeClickFrequency, audioContext.currentTime); // Set the frequency for the click (500 Hz)

    gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Set the initial volume to maximum
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1); // Quickly decrease the volume for a short click

    oscillator.connect(gainNode); // Connect the oscillator to the gain node
    gainNode.connect(audioContext.destination); // Connect the gain node to the audio context output (speakers)

    oscillator.start(); // Start the oscillator
    oscillator.stop(audioContext.currentTime + 0.1); // Stop the oscillator after 100ms to create a short click
}



// Function for the metronome accent click (first beat)
function playMetronomeAccent() {

    if (metronomeMuted) return; // Exit immediately if the metronome is muted

    const oscillator = audioContext.createOscillator(); // Create an oscillator for the sound
    const gainNode = audioContext.createGain(); // Create a gain node to control the volume

    oscillator.type = 'square'; // Set the oscillator wave type to square
    oscillator.frequency.setValueAtTime(metronomeAccentFrequency, audioContext.currentTime); // Set a higher frequency for the accented click (800 Hz)

    gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Set the initial volume to maximum
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1); // Quickly decrease the volume for a short accent sound

    oscillator.connect(gainNode); // Connect the oscillator to the gain node
    gainNode.connect(audioContext.destination); // Connect the gain node to the audio context output (speakers)

    oscillator.start(); // Start the oscillator
    oscillator.stop(audioContext.currentTime + 0.1); // Stop the oscillator after 100ms to create a short accent sound
}




// -------------------- TIME SIGNATURE -------------------- //

const timeSignatureSelect = document.getElementById('timeSignature'); // Get the dropdown element for time signature selection

timeSignatureSelect.addEventListener('change', function() {
    const [beats, noteValue] = this.value.split('/').map(Number); // Parse the selected time signature into beats and note value

    // Update beatsPerBar based on the selected time signature
    beatsPerBar = beats;

    // Adjust beatDuration depending on whether the note value is quarters, eighths, etc.
    beatDuration = (60000 / bpm) * (4 / noteValue);

    // Update the staff length based on the new time signature
    staffLength = numberOfBars * barWidth;
    canvas.width = staffLength; // Update the canvas width to match the staff length

    // Clear and redraw the canvas with the new time signature configuration
    clearStaff();
    drawReferenceBars();

    // Restart the metronome if it is currently running
    if (metronomePlaying) {
        stopMetronome(); // Stop the current metronome
        startMetronome(); // Restart the metronome with the updated settings
    }
});




// -------------------- ZOOM -------------------- //

let isZoomedIn = false; // Variable to track the zoom state
let originalCanvasWidth = canvas.width; // Store the original width of the canvas in pixels
let originalCanvasStyleWidth = canvas.style.width; // Store the original CSS style width of the canvas

function toggleZoom() {
    const zoomFactor = 1.1; // Zoom factor for the displayed width
    const zoomButton = document.getElementById('zoomButton'); // Get the zoom button element

    if (!isZoomedIn) {
        // Visually enlarge the canvas width using style.width
        canvas.style.width = `${originalCanvasWidth * zoomFactor}px`; // Apply zoom to the visual width
        zoomButton.textContent = '🔍 -'; // Change the button icon to indicate zoom out
    } else {
        // Restore the original visual width without modifying canvas.width
        canvas.style.width = originalCanvasStyleWidth; // Reset to the original visual width
        zoomButton.textContent = '🔍 +'; // Change the button icon to indicate zoom in
    }

    isZoomedIn = !isZoomedIn; // Toggle the zoom state

    // Update and redraw the elements on the canvas
    clearStaff(); // Clear the canvas content
    drawReferenceBars(); // Redraw the reference bars
    redrawNotes(); // Redraw the keyboard notes
    drawAllNumbers(); // Redraw the pad numbers
}





// -------------------- MULTITRACK RECORDER: recording and playback of the recording on four separate tracks, 
// without the possibility of playing back with the metronome. 
// Possibility of recording PAD and keyboard indifferently and also together.  -------------------- //


// Global variables for recording and Pre-Roll
let activeTrackIndex = -1; // Index of the currently active track for recording
let isGlobalRecording = false; // State of global recording
const preRollBars = 2; // Number of bars for Pre-Roll (configurable)
let isPreRollActive = false; // Flag to check if Pre-Roll is active

const tracks = Array(4).fill(null).map(() => ({
    audioData: [], // Array to store recorded notes
    isRecording: false, // Indicates if the track is currently recording
    recordStartTime: null, // Real start time of the recording
}));


// Function to start recording with Pre-Roll to prepare the user for record
function startRecordingWithPreRoll(trackIndex) {
    if (isGlobalRecording || isPreRollActive) return; // Avoid conflicts if recording or Pre-Roll is already active
    isPreRollActive = true; // Set Pre-Roll as active
    const totalPreRollDuration = preRollBars * beatsPerBar * beatDuration; // Total duration of the Pre-Roll in milliseconds
    console.log(`Starting Pre-Roll of ${preRollBars} bars (${totalPreRollDuration} ms)`);

    // After the Pre-Roll duration, start recording
    setTimeout(() => {
        isPreRollActive = false; // Deactivate Pre-Roll
        startRecording(trackIndex); // Start the recording process
        tracks[trackIndex].recordStartTime = performance.now(); // Save the actual start time of the recording
    }, totalPreRollDuration);
}



// Function to start recording
function startRecording(trackIndex) {
    activeTrackIndex = trackIndex; // Set the active track index
    const track = tracks[trackIndex];
    track.audioData = []; // Reset any previous audio data
    track.isRecording = true; // Mark the track as recording
    isGlobalRecording = true; // Indicate that a recording is in progress
}


// Function to stop recording
function stopRecording(trackIndex) {
    const track = tracks[trackIndex];
    track.isRecording = false; // Mark the track as no longer recording
    activeTrackIndex = -1; // Reset the active track index
    isGlobalRecording = false; // Indicate that no recording is in progress
}


// Function to finalize the recording
function finalizeRecording(trackIndex) {
    const track = tracks[trackIndex];
    const preRollOffset = preRollBars * beatsPerBar * beatDuration; // Calculate the Pre-Roll duration in milliseconds

    if (!track.audioData.length) {
        console.warn(`No notes recorded on track ${trackIndex + 1}`); // Log a warning if no notes were recorded
        return; // Exit if there is no audio data
    }

    // Normalize the note timings to remove the Pre-Roll offset
    track.audioData = track.audioData.map(noteData => ({
        ...noteData,
        startTime: noteData.startTime - track.recordStartTime - preRollOffset // Adjust start times to exclude Pre-Roll
    })).filter(noteData => noteData.startTime >= 0); // Remove any notes that start during the Pre-Roll

    console.log(`Recording finalized on track ${trackIndex + 1}, Pre-Roll removed`); // Log the finalized recording
}



// Create GainNodes for each track to dynamically adjust the volume in real-time during playback
tracks.forEach((track, index) => {
    track.gainNode = audioContext.createGain(); // Create a GainNode for the track
    track.gainNode.gain.value = 1; // Set the initial volume to 100%
    track.gainNode.connect(audioContext.destination); // Connect the GainNode to the audio destination (output)
});



// Function to update the volume of a track
function updateVolume(trackIndex, volume) {
    if (trackIndex >= 0 && trackIndex < tracks.length) { // Check if the track index is valid
        const track = tracks[trackIndex];
        track.gainNode.gain.value = volume; // Update the gain value (volume) of the track
    }
}



// Function to play a track with volume control
function playTrack(trackIndex) {
    const track = tracks[trackIndex];
    if (!track.audioData.length) {
        console.log(`No notes recorded on track ${trackIndex + 1}`); // Log if there are no notes in the track
        return; // Exit if the track has no recorded notes
    }

    const globalStartTime = performance.now(); // Record the global start time of playback

    console.log(`Playing track ${trackIndex + 1}`); // Log the track being played


    // Iterate through the recorded notes in the track
    track.audioData.forEach(noteData => {
        const notePlaybackTime = globalStartTime + (noteData.startTime - track.recordStartTime); // Calculate when the note should play
        const delay = notePlaybackTime - performance.now(); // Calculate the delay before playing the note

        if (delay >= 0) { // Play the note only if the delay is non-negative
            setTimeout(() => {


                // Determine the audio file path based on the note type
                const audioPath = Number.isInteger(Number(noteData.note)) && Number(noteData.note) >= 1 && Number(noteData.note) <= 9
                ? `sounds/sounds/${noteData.ambiente}/Pad/suono${noteData.note}.mp3` 
                : `sounds/sounds/${noteData.ambiente}/Timbre${noteData.timbro.split(' ')[1] || 1}/${noteData.note}.mp3`;
            

                const audio = new Audio(audioPath); // Create an audio object for the sound
                const trackSource = audioContext.createMediaElementSource(audio); // Create a media element source
                trackSource.connect(track.gainNode); // Connect the track's GainNode for volume control


                audio.play().catch(error => console.error("Error loading audio: ", error)); // Play the audio or log an error if it fails

                // Stop the audio after its duration if specified
                if (noteData.duration) {
                    setTimeout(() => {
                        audio.pause(); // Pause the audio
                        audio.currentTime = 0; // Reset the playback position
                    }, noteData.duration);
                }

            }, delay); // Play the note after the calculated delay
        }
    });
}


// Function to highlight the canvas during recording
function highlightTrackCanvas(trackIndex, isRecording) {
    const canvas = document.getElementById(`track-canvas-${trackIndex + 1}`); // Get the canvas for the specified track
    canvas.style.border = isRecording ? "2px solid red" : "1px solid #555"; // Change the border color based on recording state
}



// Function to draw rectangles on a track (for visualization purposes)
// Main canvas element
const mainCanvas = document.getElementById('staffCanvas');

// Function to copy the content of the main canvas to the canvas of a specific track
function copyCanvasToTrack(trackIndex) {
    const trackCanvas = document.getElementById(`track-canvas-${trackIndex}`);
    const trackCtx = trackCanvas.getContext('2d');

      // Get the image data from the main canvas
    const imageData = mainCanvas.toDataURL();

    // Create a new image object
    const image = new Image();
    image.onload = function () {
       // Resize the track canvas to match the dimensions of the main canvas
        trackCanvas.width = mainCanvas.width;
        trackCanvas.height = mainCanvas.height;

        // Draw the image onto the track canvas
        trackCtx.clearRect(0, 0, trackCanvas.width, trackCanvas.height);
        trackCtx.drawImage(image, 0, 0);
    };

    image.src = imageData; // Set the source of the image to the data URL from the main canvas
}



// Function to delete a track (audio and visual content from the canvas)
function deleteTrack(trackIndex) {
     // Clear the audio data for the specified track
    tracks[trackIndex].audioData = [];
    
    // Get the canvas corresponding to the track
    const trackCanvas = document.getElementById(`track-canvas-${trackIndex + 1}`);
    if (trackCanvas) {
        const trackCtx = trackCanvas.getContext('2d');
        
        // Clear the content of the canvas
        trackCtx.clearRect(0, 0, trackCanvas.width, trackCanvas.height);
    } else {
        console.warn(`Canvas per la traccia ${trackIndex + 1} non trovato.`);
    }
}



// Event listeners for the record buttons
document.querySelectorAll('.record-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const trackIndex = parseInt(btn.dataset.track, 10) - 1;

        if (tracks[trackIndex].isRecording) {
           // Stop the recording if it is currently active
            stopRecording(trackIndex);
            btn.textContent = 'Rec'; // Change the button text to "Rec"
        } else {
            // Start recording with Pre-Roll if it is not currently active
            startRecordingWithPreRoll(trackIndex);
            btn.textContent = 'Stop'; // Change the button text to "Stop"
        }
    });
});



// Event listeners for the play buttons
document.querySelectorAll('.play-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const trackIndex = parseInt(btn.dataset.track, 10) - 1;// Get the track index from the button's data attribute
        playTrack(trackIndex); // Play the track
        console.log(`Riproduzione traccia ${trackIndex + 1}`);
    });
});


// Event listeners for the delete buttons
document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const trackIndex = parseInt(btn.dataset.track) - 1;
        deleteTrack(trackIndex);// Delete the track
    });
});


// Link volume sliders to volume control
document.querySelectorAll('.volume-slider').forEach((slider) => {
    slider.addEventListener('input', () => {
        const trackIndex = parseInt(slider.dataset.track) - 1; // Get the track index from the slider's data attribute
        const value = parseFloat(slider.value); // Get the slider value as a float (0 to 1)
        updateVolume(trackIndex, value); // Update the track's volume
    });
});


// Event listeners for the "Copy Canvas" buttons
document.querySelectorAll('.copy-canvas-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const trackIndex = button.dataset.track;// Get the track index from the button's data attribute
        copyCanvasToTrack(trackIndex); // Copy the main canvas content to the track canvas
    });
});


// Function to play all tracks simultaneously
document.getElementById('global-play').addEventListener('click', () => {
    tracks.forEach((track, index) => playTrack(index));// Play each track
});


// Function to download all tracks as a mixed audio file
document.getElementById('download-audio').addEventListener('click', () => {
    downloadAllTracks();// Implement logic for mixing and downloading tracks
});




//-------------------- NUMBER ON CANVAS -------------------- //

let activeNumbersWithPositions = []; // Array to store numbers with positions { number, x }
let activeNumbers = []; // Array to track active numbers on the canvas
const maxNumbersOnCanvas = 9; // Maximum number of numbers allowed on the canvas
let numberColors = {}; // Map to store colors associated with numbers
const defaultColor = "black"; // Default color for numbers
let lastBarX = 0; // Tracks the last X position of the bar


// Function to calculate the vertical position of a number on the canvas
function getYPositionForNumber(number) {
    const canvasHeight = canvas.height;
    const step = canvasHeight / maxNumbersOnCanvas;
    return canvasHeight - step * number + step / 2; // Calculate the vertical position based on the canvas
}


function drawNumberOnCanvas(number, x, color) {
    const y = getYPositionForNumber(number); // Get the vertical position of the number
    const rectWidth = 35; // Width of the rectangle
    const rectHeight = 30; // Height of the rectangle
    const cornerRadius = 5; // Raggio degli angoli arrotondati

    // Draw the black rectangle with rounded corners
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
    ctx.fillStyle = "black"; // Set the rectangle color to black
    ctx.fill();

    // Draw the white number inside the rectangle
    ctx.fillStyle = "white";  // Set the text color to white
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(number, x + rectWidth / 2, y); // Position the number in the center of the rectangle
}


// Function to draw all numbers currently active on the canvas
function drawAllNumbers() {
    activeNumbersWithPositions.forEach(({ number, x, color }) => {
        drawNumberOnCanvas(number, x, color); // Use the specific color for each instance
    });
}

// Example of adding a number with a position and color to the active list
activeNumbersWithPositions.push({
    number,
    x,
    color: numberColors[number] || defaultColor // Initial color for the number
});




// -------------------- DOWNLOAD -------------------- // 
async function downloadAllTracks() {
    const sampleRate = 44100; // Standard sampling frequency
    let maxDuration = 0; // Dynamic maximum duration

     // Calculate the total duration of all tracks
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
                maxDuration = noteEndTime; // Update the maximum duration
            }
        });
    }

     // Convert `maxDuration` to seconds and set a minimum value
    maxDuration = Math.max(Math.ceil(maxDuration / 1000), 1); // In seconds, at least 1 second

    // Create an OfflineAudioContext with the dynamic duration
    const offlineContext = new OfflineAudioContext(2, sampleRate * maxDuration, sampleRate);
    const bufferSources = [];

    // Function to load audio files
    async function loadAudio(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return await offlineContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error(`Errore nel caricamento dell'audio: ${url}`, error);
        }
    }

     // Load and mix all tracks
    for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        const track = tracks[trackIndex];
        if (!track.audioData.length) continue;

        for (const noteData of track.audioData) {
            const audioPath = Number.isInteger(Number(noteData.note)) && Number(noteData.note) >= 1 && Number(noteData.note) <= 9
                ? `sounds/sounds/${ambienteCorrente.nome}/Pad/suono${noteData.note}.mp3` // Path for PAD sounds
                : `sounds/sounds/${ambienteCorrente.nome}/Timbre${setCorrente?.nome.split(' ')[1] || 1}/${noteData.note}.mp3`; // Path for keyboard sounds

            const audioBuffer = await loadAudio(audioPath);
            if (!audioBuffer) continue;

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            const startTime = (noteData.startTime - track.recordStartTime) / 1000; // In seconds
            source.connect(offlineContext.destination);
            source.start(startTime);

            bufferSources.push(source);
        }
    }

    const renderedBuffer = await offlineContext.startRendering();

    // Convert the buffer to a WAV file
    const wavBlob = bufferToWav(renderedBuffer);
    const url = URL.createObjectURL(wavBlob);

   // Create the filename based on the current environment
    const ambienteName = ambienteCorrente?.nome || 'default-environment'; // Use the environment name or a default value
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ambienteName}-all-tracks.wav`; // Customized file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log(`Download completato: ${ambienteName}-all-tracks.wav`);
}



// Function to convert an AudioBuffer to a WAV file
function bufferToWav(buffer) {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
// Helper function to write a string into the DataView
    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    let offset = 0;

    // Write the WAV file header
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

    // Retrieve the audio data for each channel
    const channels = [];
    for (let i = 0; i < numOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    // Write the audio data samples
    let sampleIndex = 0;
    while (sampleIndex < buffer.length) {
        for (let i = 0; i < numOfChannels; i++) {
            const sample = Math.max(-1, Math.min(1, channels[i][sampleIndex]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
        sampleIndex++;
    }
    // Return the WAV file as a Blob
    return new Blob([bufferArray], { type: 'audio/wav' });
}
