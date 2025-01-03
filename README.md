# Ambient Machine

## Overview

**Ambient Machine** is an interactive web-based synthesizer simulator, complete with a keyboard, pad, recorder, effects, and a visual interface for monitoring your music in real-time. The platform is designed to be intuitive and engaging for users of all skill levels, making it easy to explore, create, and record music inspired by various ambient environments.

**Browser Recommendation**: For optimal performance, it is strongly recommended to use Mozilla Firefox. While the site may work on other browsers, Firefox ensures full compatibility and smooth operation of all features.

---

## Features

### **Ambient Environments**
Ambient Machine includes **four pre-defined environments**:

- **City**
- **Home**
- **Nature**
- **Sea**

Each environment comes with unique soundscapes:
- **Pad**: Provides percussive sounds.
- **Keyboard**: Offers melodic sounds with up to 4 selectable timbres per environment.

#### Custom Environments
Users can add their own custom environment by:
1. Uploading a folder containing audio files.
2. Modifying the accompanying JSON file to define the new environment.
3. Alternatively, the folder can be added to Dropbox, and the link to the folder can be referenced in the JSON file.

#### Example Folder Structure
To ensure compatibility, the folder structure for an environment should follow this example:

- **Keyboard Notes (Sea, Timbre 3):** `\sounds\sounds\Sea\Timbre3`
- **Pad Sounds (Sea):** `\sounds\sounds\Sea\pad`

This structure organizes sounds into subfolders for each environment and categorizes them for the keyboard and pad.


#### Sound Design
The sounds for the various environments were sourced using two primary methods:
- **Recording**: Many sounds were captured using a Zoom H6 recorder to ensure high-quality and authentic audio.
- **Freesound**: For sounds that were difficult to capture, resources from [Freesound](https://freesound.org) were used under appropriate licensing.

All audio files were processed with **Reaper** to adjust their length and quality, making them suitable for the synthesizer. For keyboard sounds, the pitch of each note was carefully analyzed using [Singing Carrots](https://singingcarrots.com/analyser/mp3) and then shifted across the keyboard range using [Audioalter](https://audioalter.com/pitch-shifter).

---

### **Keyboard Features**
- Supports octave changes, ranging from **C3 to F5**.
- Four selectable timbres per environment.
- Effects can be applied to the keyboard sounds, including:
  - **Delay**
  - **Flanger**
  - **Distortion**
  - **Chorus**
- Multiple effects can be enabled simultaneously, with adjustable effect levels.

---

### **Visual Feedback and Interaction**
- **Fourier Transform Display**: A small graphical visualization in the top black screen shows a Fourier Transform of the keyboard notes, enhancing interactivity. There is also a button to enable or disable the visualizer, as it requires the PC's processor to handle large amounts of data simultaneously. If the user's computer is not very powerful, this feature might slow down other site functions.

- **Canvas**:
  - Tracks keyboard notes (including duration) and pad presses.
  - Offers BPM selection with a metronome (can be muted).
  - Allows users to:
    - Clean the canvas to reset visual data.
    - Adjust the number of measures (from 4 to 16).
    - Change the time signature.
    - Zoom the viewing window for better note and pad visibility.

---

### **Recording Capabilities**
- Record up to **4 separate tracks**.
- Features for each track include:
  - Adjust volume.
  - Delete the track.
  - Replay the track (requires prior recording using "Copy on Track").
- **Final Export**: Combine all recorded tracks into a single audio file to create a complete song, which can be downloaded only in .WAV format.
- **Metronome Requirement**: Recording does not start unless the metronome is active, ensuring proper synchronization.
- **Pre-Roll**: The recording starts after 2 measures to give users time to prepare.
---

## How to Use

1. **Select an Environment**:
   - Choose one of the default environments or load a custom environment.

2. **Explore Sounds**:
   - Use the pad for percussive sounds.
   - Play the keyboard for melodic tones and experiment with timbres and octaves.

3. **Add Effects**:
   - Apply effects to keyboard sounds and adjust their levels for unique soundscapes.

4. **Visualize and Adjust**:
   - Monitor your music on the canvas and Fourier transform display.
   - Set BPM, measures, and time signature as needed.

5. **Record and Create**:
   - Record up to 4 tracks.
   - Edit, replay, and combine them into a single downloadable song.

---
## How It Works

The core functionality of **Ambient Machine** is powered by a JavaScript architecture that integrates audio playback, recording, and interactive user interfaces. Here's a detailed breakdown of its components and how they function:

### **Environment Selection and Sound Management**
1. **Dynamic Loading of Environments**:
   - The **`popolaMenuAmbienti`** function populates the dropdown menu with available environments listed in the `Environments.json` file.
   - Each environment includes a unique set of sounds for the keyboard and pad, along with a background image.

2. **Changing the Environment**:
   - **`cambiaAmbiente`** dynamically updates the loaded sounds and visuals when a user selects a new environment. It also resets sound configurations and sets default values for the pad and keyboard.

3. **Sound Set Selection**:
   - Through **`cambiaSetSuoni`**, users can switch between predefined timbres. This function remaps the keyboard's notes to match the new set of sounds.

4. **Visual Customization**:
   - **`cambiaSfondo`** changes the application's background image to match the chosen environment, providing a visual representation of the ambiance.

---

### **Keyboard Interaction**
1. **Playing Notes**:
   - **`playNote`** triggers audio playback for a specific note. It dynamically applies active effects (e.g., flanger, delay) and visually represents the note on the canvas.

2. **Stopping Notes**:
   - **`stopNote`** halts the playback of a note and finalizes its visual representation, allowing for accurate timing in the displayed music.

3. **Octave Management**:
   - **`updateKeyLabels`** ensures that the visual labels on the keyboard reflect the currently selected octave, ranging from **C3 to F5**.

---

### **Pad Interaction**
1. **Interactive Pads**:
   - **`playPadSound`** handles audio playback for the percussion-like sounds triggered by the pad buttons. This function also synchronizes the pad's visual representation on the canvas.

---

### **Effects**
1. **Audio Effects**:
   - Functions like **`createFlanger`**, **`createDelay`**, **`createDistortion`**, and **`createChorus`** use the Web Audio API to design and apply customizable sound effects to keyboard notes.

2. **Effect Management**:
   - **`toggleEffect`** allows users to activate or deactivate effects. This includes real-time updates to the interface (e.g., turning effect LEDs on or off).

---

### **Canvas and Visual Feedback**
1. **Dynamic Visuals**:
   - **`drawActiveRectangle`** creates live visual feedback by drawing rectangles that grow as notes are played and held.
   - **`redrawNotes`** ensures previously played notes remain visible even after new notes are added.

2. **Time Bar Animation**:
   - **`drawTimeBar`** renders a moving bar across the canvas, synchronized with the current beat, aiding in tempo and rhythm visualization.
     
### **Visualizer**
1. **Canvas Initialization**:
   - The visualizer uses a canvas element (`#canvas1`) with dynamic width and a fixed height of 300px.
   - The **`initVisualizer`** function ensures the audio context and analyzer nodes are properly initialized.

2. **Audio Analysis**:
   - The analyzer node processes audio data in real-time using an FFT (Fast Fourier Transform) algorithm.
   - The processed data is represented as an array of frequencies (`dataArray`) which drives the visual display.

3. **Animation**:
   - The **`animate`** function clears the canvas on each frame and updates the visual bars based on the audio data.
   - Bars are drawn using the **`drawVisualizer`** function, which uses a radial pattern with dynamic colors (hue-based) and bar heights proportional to the frequency amplitude.

4. **Interactivity**:
   - Notes triggered via keyboard (`keydown` events) or mouse clicks on piano keys (`mousedown` events) are processed through the **`processNoteFromJSON`** function, which:
     - Fetches the audio file for the note.
     - Decodes and plays the audio while connecting it to the analyzer for visualization.
   - A fading effect is applied when the note ends, gradually reducing the visual bars until they disappear.

---

### **Metronome and Time Management**
1. **Synchronizing Playback**:
   - **`startMetronome`** and **`stopMetronome`** control the metronome's beat cycle, with options to include accented beats for rhythm guidance.

2. **Mute and Beat Adjustment**:
   - **`toggleMetronomeMute`** silences the metronome without affecting the timekeeping visuals.

3. **Animated Syncing**:
   - **`animateTimeBar`** ensures the time bar movement aligns perfectly with the tempo (BPM) and time signature.

---

### **Recording and Playback**
1. **Track Recording**:
   - **`startRecordingWithPreRoll`** initiates recording with a pre-roll countdown, giving users time to prepare.
   - **`stopRecording`** finalizes the recording and stores the data for playback or export.

2. **Track Playback**:
   - **`playTrack`** replays recorded tracks, syncing with the metronome and time bar to provide accurate timing.

3. **Volume Control**:
   - **`updateVolume`** lets users adjust the playback volume for individual tracks.

---

### **Utilities**
1. **Canvas Management**:
   - **`clearStaff`** clears the canvas without deleting recorded notes, while **`copyCanvasToTrack`** saves a snapshot of the canvas for specific tracks.

2. **Zoom Functionality**:
   - **`toggleZoom`** allows users to zoom in and out of the canvas for a more detailed or broader view of the visual feedback.

3. **Dynamic Cleanup**:
   - Users can clear all notes and reset the canvas with a single action using **`clearAllNotes`**.

---

The thoughtful integration of these functions ensures that Ambient Machine delivers an engaging, flexible, and interactive musical experience. Each component works in harmony, providing users with tools to explore soundscapes, record compositions, and visualize their creations in real time.

### Team Contribution
This project was a collaborative effort by a group of four contributors:

- **Carmen Frieda Franci**
- **Stefano Liera**
- **Marco Bruni**
- **Nicola Magno**

The design of Ambient Machine allowed for a highly modular and efficient division of tasks. Each team member worked on a distinct module, ensuring minimal overlap and seamless integration:

- **Carmen Frieda Franci**: Focused on creating the pad, keyboard, and audio effects system. Her work involved designing interactive and visually engaging components for real-time sound manipulation.
- **Stefano Liera**: Specialized in developing the canvas and recorder functionalities. Stefano ensured that all visual elements and recording capabilities were robust and user-friendly.
- **Marco Bruni**: Took charge of implementing the four ambient environments, crafting a dynamic and immersive experience with unique soundscapes.
- **Nicola Magno**: Built the note visualizer using Fourier transforms, enabling users to see real-time graphical representations of the sounds being played.


Enjoy creating music with **Ambient Machine**!

