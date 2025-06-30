// Metronome Module - Metronome functionality and BPM control

let metronomeState = { isPlaying: false, bpm: 120, nextNoteTime: 0.0, timerID: null };

// --- Metronome Functions ---
const scheduler = () => {
    const audioContext = window.audioContext;
    if (!audioContext) {
        console.error('No audioContext in scheduler');
        return;
    }
    
    while (metronomeState.nextNoteTime < audioContext.currentTime + 0.1) {
        const osc = audioContext.createOscillator(), amp = audioContext.createGain();
        osc.connect(amp).connect(audioContext.destination);
        osc.frequency.value = 880.0;
        amp.gain.setValueAtTime(1.0, metronomeState.nextNoteTime);
        amp.gain.exponentialRampToValueAtTime(0.001, metronomeState.nextNoteTime + 0.05);
        osc.start(metronomeState.nextNoteTime);
        osc.stop(metronomeState.nextNoteTime + 0.05);
        
        // Flash the metronome LED
        flashMetronomeLED();
        
        metronomeState.nextNoteTime += 60.0 / metronomeState.bpm;
    }
    metronomeState.timerID = window.setTimeout(scheduler, 25.0);
};

const flashMetronomeLED = () => {
    const metronomeLED = document.getElementById('metronome-led');
    if (metronomeLED) {
        metronomeLED.classList.add('metronome');
        setTimeout(() => {
            metronomeLED.classList.remove('metronome');
        }, 100);
    }
};

const toggleMetronome = (button, start) => {
    if(start === metronomeState.isPlaying) return;
    
    const audioContext = window.audioContext;
    if (!audioContext) {
        console.error('Audio context not available');
        return;
    }
    
    metronomeState.isPlaying = start;
    if (start) { 
        metronomeState.nextNoteTime = audioContext.currentTime; 
        scheduler(); 
    } else { 
        window.clearTimeout(metronomeState.timerID); 
    }
    button.classList.toggle('active', start);
};

// Export functions for use in other modules
window.metronome = {
    metronomeState,
    toggleMetronome
}; 