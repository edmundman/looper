// Main Module - Application initialization and event setup

window.onload = () => {
    // Wait a bit to ensure all modules are loaded
    setTimeout(() => {
        initializeApp();
    }, 100);
};

function initializeApp() {
    // Get references to modules
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const showMessage = window.audioEngine ? window.audioEngine.showMessage : (msg) => console.log(msg);
    const updateTrackState = window.audioEngine ? window.audioEngine.updateTrackState : (id, state) => console.log(`Track ${id} state: ${state}`);
    const initAudio = window.audioEngine ? window.audioEngine.initAudio : async () => false;
    const handleUiClick = window.ui ? window.ui.handleUiClick : () => {};
    const handleDragStart = window.ui ? window.ui.handleDragStart : () => {};
    const renderTracks = window.ui ? window.ui.renderTracks : () => {};
    
    // Initialize tracks if they don't exist
    if (window.audioEngine && !window.audioEngine.tracks[1]) {
        for (let i = 1; i <= 6; i++) {
            window.audioEngine.tracks[i] = {
                state: 'empty',
                volume: 1.0,
                speed: 1.0,
                isMuted: false,
                audioBuffer: null,
                recordedChunks: [],
                fx: [
                    { type: 'none', angle: -135 },
                    { type: 'none', angle: -135 },
                    { type: 'none', angle: -135 }
                ],
                nodePool: {},
                mainGain: null,
                analyserNode: null,
                playingSource: null,
                visualizationId: null
            };
        }
    }
    
    // Initialize UI
    renderTracks();
    
    // Ensure metronome is available
    if (!window.metronome) {
        console.error('Metronome module not loaded');
        return;
    }
    
    // Metronome toggle button logic
    const metronomeBtn = document.getElementById('metronomeToggle');
    metronomeBtn.addEventListener('click', async () => {
        if (await initAudio()) {
            window.metronome.toggleMetronome(metronomeBtn, !window.metronome.metronomeState.isPlaying);
        }
    });
    
    // BPM input handler
    document.getElementById('bpmInput').addEventListener('input', e => { 
        const bpm = parseInt(e.target.value); 
        if(bpm > 20 && bpm < 300) window.metronome.metronomeState.bpm = bpm; 
    });
    
    // Event listeners for UI interactions
    document.getElementById('loop-tracks-container').addEventListener('change', e => handleUiClick(e.target.closest('[data-action]')));
    document.getElementById('loop-tracks-container').addEventListener('click', e => handleUiClick(e.target.closest('[data-action]')));
    document.body.addEventListener('mousedown', handleDragStart);
    document.body.addEventListener('touchstart', handleDragStart, { passive: false });
    
    // File upload handlers
    for (let i = 1; i <= 6; i++) {
        const fileInput = document.getElementById(`upload-${i}`);
        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const uploadAudio = window.audioEngine ? window.audioEngine.uploadAudio : () => {};
                    await uploadAudio(i, file);
                    // Reset the file input
                    e.target.value = '';
                }
            });
        }
    }
    
    // All stop button
    document.getElementById('allStop').addEventListener('click', () => { 
        for(let i=1; i<=6; i++) {
            if(['playing', 'recording'].includes(tracks[i].state)) {
                updateTrackState(i, 'stopped'); 
            }
        }
    });
    
    // Show initial message
    showMessage("Click a track's mic to start.", "info", 6000);
} 