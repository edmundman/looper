// Audio Engine Module - Core audio functionality and track management

let audioContext;
let mediaStreamSource;
const tracks = {};

// --- State Initialization for 6 tracks ---
for (let i = 1; i <= 6; i++) {
    tracks[i] = {
        id: i, 
        state: 'empty', 
        mediaRecorder: null, 
        recordedChunks: [], 
        audioBuffer: null,
        playingSource: null, 
        mainGain: null, 
        analyserNode: null, 
        isMuted: false, 
        volume: 1.0,
        speed: 1.0,
        visualizationId: null,
        fx: [
            { type: 'none', angle: -135 }, 
            { type: 'none', angle: -135 }, 
            { type: 'none', angle: -135 }
        ]
    };
}

// --- Utility Functions ---
const showMessage = (msg, type = 'info', dur = 4000) => {
    const box = document.getElementById('messageBox');
    box.textContent = msg;
    const colors = { error: 'bg-red-600', success: 'bg-green-600', info: 'bg-blue-600' };
    box.className = `fixed top-5 left-1/2 -translate-x-1/2 z-50 text-white font-bold px-6 py-3 rounded-lg shadow-lg ${colors[type] || 'bg-gray-700'}`;
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, dur);
};

const createReverbImpulse = (decay = 2.5) => {
    if (!audioContext) return null;
    const rate = audioContext.sampleRate, len = rate * decay;
    const impulse = audioContext.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
        const channel = impulse.getChannelData(c);
        for (let i = 0; i < len; i++) channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    }
    return impulse;
};

// --- Audio Initialization & Routing ---
async function initAudio() {
    if (audioContext && audioContext.state === 'running') return true;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();
        mediaStreamSource = await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => audioContext.createMediaStreamSource(s));

        const reverbImpulse = createReverbImpulse();
        const distortionCurve = makeDistortionCurve(400);

        for (let i = 1; i <= 6; i++) {
            tracks[i].mainGain = audioContext.createGain();
            tracks[i].analyserNode = audioContext.createAnalyser();
            tracks[i].analyserNode.fftSize = 2048;
            
            // Create basic effects first
            tracks[i].nodePool = {
                // Basic filters
                lowpass: audioContext.createBiquadFilter(), 
                highpass: audioContext.createBiquadFilter(),
                bandpass: audioContext.createBiquadFilter(), 
                filter: audioContext.createBiquadFilter(),
                
                // Distortion effects
                distortion: audioContext.createWaveShaper(),
                
                // Delay effects
                delay: audioContext.createDelay(5.0), 
                
                // Modulation
                tremolo: audioContext.createGain(),
                
                // Spatial effects
                panner: audioContext.createStereoPanner(), 
                
                // Reverb
                reverb: audioContext.createConvolver()
            };

            // Set up basic effect properties
            Object.keys(tracks[i].nodePool).forEach(key => {
                const node = tracks[i].nodePool[key];
                if (node instanceof BiquadFilterNode) node.type = key;
                if (key === 'distortion') node.curve = distortionCurve;
                if (key === 'reverb' && reverbImpulse) node.buffer = reverbImpulse;
            });
        }
        
        showMessage("Audio Ready", 'success');
        return true;
    } catch (err) { 
        console.error(err); 
        showMessage("Mic access denied.", 'error'); 
        return false; 
    }
}

function setupEffectRouting(trackId) {
    const track = tracks[trackId];
    if (!track.playingSource || !track.mainGain) return;
    track.playingSource.disconnect();
    let lastConnectedNode = track.playingSource;
    
    // Count instances of each effect type for combination
    const effectCounts = {};
    track.fx.forEach(fxSlot => {
        if (fxSlot.type !== 'none') {
            effectCounts[fxSlot.type] = (effectCounts[fxSlot.type] || 0) + 1;
        }
    });
    
    // Create unique effect instances for each type
    const uniqueEffects = {};
    Object.keys(effectCounts).forEach(effectType => {
        if (!track.nodePool[effectType]) {
            // Create the effect based on type
            switch (effectType) {
                case 'phaser':
                    track.nodePool[effectType] = window.effects.createPhaser();
                    break;
                case 'flanger':
                    track.nodePool[effectType] = window.effects.createFlanger();
                    break;
                case 'chorus':
                    track.nodePool[effectType] = window.effects.createChorus();
                    break;
                case 'tapeEcho':
                    track.nodePool[effectType] = window.effects.createTapeEcho();
                    break;
                case 'slicer':
                    track.nodePool[effectType] = window.effects.createSlicer();
                    break;
                case 'vinylFlick':
                    track.nodePool[effectType] = window.effects.createVinylFlick();
                    break;
                case 'loFi':
                    track.nodePool[effectType] = window.effects.createLoFi();
                    break;
                case 'eq':
                    track.nodePool[effectType] = window.effects.createEQ();
                    break;
                case 'compressor':
                    track.nodePool[effectType] = window.effects.createCompressor();
                    break;
                case 'isolator':
                    track.nodePool[effectType] = window.effects.createIsolator();
                    break;
                case 'reverb':
                    track.nodePool[effectType] = window.effects.createReverb();
                    // Set up reverb impulse response
                    const reverbImpulse = createReverbImpulse();
                    if (reverbImpulse) {
                        track.nodePool[effectType].buffer = reverbImpulse;
                    }
                    break;
                case 'filter':
                    track.nodePool[effectType] = window.effects.createFilter();
                    break;
                case 'lowpass':
                    track.nodePool[effectType] = window.effects.createLowpass();
                    break;
                case 'highpass':
                    track.nodePool[effectType] = window.effects.createHighpass();
                    break;
                case 'bandpass':
                    track.nodePool[effectType] = window.effects.createBandpass();
                    break;
                case 'pan':
                    track.nodePool[effectType] = window.effects.createPan();
                    break;
                case 'delay':
                    track.nodePool[effectType] = window.effects.createDelay();
                    break;
                case 'tremolo':
                    track.nodePool[effectType] = window.effects.createTremolo();
                    break;
                case 'distortion':
                    track.nodePool[effectType] = window.effects.createDistortion();
                    // Set up distortion curve
                    const distortionCurve = window.effects.makeDistortionCurve(400);
                    track.nodePool[effectType].curve = distortionCurve;
                    break;
            }
        }
        
        const effectNode = track.nodePool[effectType];
        if (effectNode) {
            // Connect the effect to the chain
            lastConnectedNode.connect(effectNode);
            lastConnectedNode = effectNode;
            
            // Apply combined parameters from all instances of this effect type
            const totalAmount = track.fx
                .filter(fxSlot => fxSlot.type === effectType)
                .reduce((sum, fxSlot) => sum + fxSlot.angle, 0) / track.fx.filter(fxSlot => fxSlot.type === effectType).length;
            
            const normalizedAmount = (totalAmount + 135) / 270; // Convert from -135 to +135 range to 0-1
            window.effects.applyEffectParameter(effectNode, effectType, normalizedAmount, effectCounts[effectType]);
        }
    });
    
    lastConnectedNode.connect(track.mainGain);
    track.mainGain.connect(track.analyserNode);
    if (!track.isMuted) track.analyserNode.connect(audioContext.destination);
    else track.analyserNode.disconnect();
}

// --- Core Audio & State Functions ---
const startRecording = (trackId) => {
    const track = tracks[trackId];
    if (!mediaStreamSource) { showMessage('Audio source not ready.', 'error'); return; }
    track.recordedChunks = [];
    track.mediaRecorder = new MediaRecorder(mediaStreamSource.mediaStream);
    track.mediaRecorder.ondataavailable = e => e.data.size > 0 && track.recordedChunks.push(e.data);
    track.mediaRecorder.onstop = async () => {
        try {
            track.audioBuffer = await audioContext.decodeAudioData(await new Blob(track.recordedChunks).arrayBuffer());
            if (track.state === 'recording') updateTrackState(trackId, 'playing');
            // Initialize in/out editor after audio is loaded
            if (window.ui && window.ui.setupInOutEditor) {
                window.ui.setupInOutEditor(trackId);
            }
        } catch (e) {
            showMessage(`Track ${trackId} audio error.`, 'error');
            updateTrackState(trackId, 'empty');
        }
    };
    // Start recording with 100ms timeslice to ensure regular data chunks
    track.mediaRecorder.start(100);
};

const stopRecording = (trackId) => {
    const track = tracks[trackId];
    if (track.mediaRecorder && track.mediaRecorder.state === 'recording') track.mediaRecorder.stop();
};

const stopLoop = (trackId) => {
    const track = tracks[trackId];
    if (track.playingSource) { 
        track.playingSource.stop(); 
        track.playingSource.disconnect(); 
        track.playingSource = null; 
    }
    if (track.visualizationId) { 
        cancelAnimationFrame(track.visualizationId); 
        track.visualizationId = null; 
    }
};

const clearTrack = (trackId) => {
    stopLoop(trackId);
    stopRecording(trackId);
    tracks[trackId].audioBuffer = null;
    tracks[trackId].recordedChunks = [];
    const canvas = document.getElementById(`vis-canvas-${trackId}`);
    if(canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    updateTrackState(trackId, 'empty');
    showMessage(`Track ${trackId} cleared.`, 'info');
};

function playLoop(trackId) {
    const track = tracks[trackId];
    if (!track.audioBuffer || !track.mainGain) return;
    stopLoop(trackId);
    if (track.speed === 0) return;
    track.playingSource = audioContext.createBufferSource();
    track.playingSource.buffer = track.audioBuffer;
    track.playingSource.loop = true;
    // Use in/out points
    const inPoint = track.inPoint || 0;
    const outPoint = track.outPoint || track.audioBuffer.duration;
    track.playingSource.loopStart = inPoint;
    track.playingSource.loopEnd = outPoint;
    track.playingSource.playbackRate.value = track.speed;
    setupEffectRouting(trackId);
    track.playingSource.start(0, inPoint);
    if(track.visualizationId) cancelAnimationFrame(track.visualizationId);
    drawWaveform(trackId);
}

function updateTrackState(trackId, newState) {
    const track = tracks[trackId];
    track.state = newState;
    
    // Use UI module's updateTrackState if available
    if (window.ui && window.ui.updateTrackState) {
        window.ui.updateTrackState(trackId, newState);
    } else {
        // Fallback to direct DOM manipulation
        const container = document.getElementById(`track-${trackId}`);
        const loopButton = container.querySelector('.loop-button-container');
        const icon = loopButton.querySelector('i');
        loopButton.classList.remove('recording', 'playing', 'stopped');
        switch (newState) {
            case 'empty': 
                icon.className = 'fas fa-microphone text-[#32ff7e]'; 
                stopLoop(trackId); 
                container.style.borderColor = '#5a5a5a'; 
                break;
            case 'recording': 
                loopButton.classList.add('recording'); 
                icon.className = 'fas fa-stop text-white'; 
                container.style.borderColor = '#ff4757'; 
                startRecording(trackId); 
                break;
            case 'playing': 
                loopButton.classList.add('playing'); 
                icon.className = 'fas fa-pause text-white'; 
                container.style.borderColor = '#32ff7e'; 
                playLoop(trackId); 
                break;
            case 'stopped': 
                loopButton.classList.add('stopped'); 
                icon.className = 'fas fa-play text-[#32ff7e]'; 
                container.style.borderColor = '#888'; 
                stopLoop(trackId); 
                break;
        }
    }
    updateMemoryDisplay();
}

const updateMemoryDisplay = () => { 
    document.getElementById('memoryDisplay').textContent = 
        Object.values(tracks).some(t=>t.state==='recording')?'RECORDING':
        Object.values(tracks).some(t=>t.state==='playing')?'PLAYING':'READY'; 
};

const drawWaveform = (trackId) => {
    const track = tracks[trackId];
    if (!track || track.state !== 'playing' || !track.analyserNode) { 
        if(track && track.visualizationId) cancelAnimationFrame(track.visualizationId); 
        return; 
    }
    
    const canvas = document.getElementById(`vis-canvas-${trackId}`);
    const canvasCtx = canvas.getContext("2d");
    
    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const bufferLength = track.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    track.analyserNode.getByteTimeDomainData(dataArray);
    
    // Clear canvas with gradient background
    const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f1a0f');
    gradient.addColorStop(1, '#1a2a1a');
    canvasCtx.fillStyle = gradient;
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    canvasCtx.strokeStyle = 'rgba(50, 255, 126, 0.1)';
    canvasCtx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(i, 0);
        canvasCtx.lineTo(i, canvas.height);
        canvasCtx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, i);
        canvasCtx.lineTo(canvas.width, i);
        canvasCtx.stroke();
    }
    
    // Draw center line
    canvasCtx.strokeStyle = 'rgba(50, 255, 126, 0.3)';
    canvasCtx.lineWidth = 2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, canvas.height / 2);
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
    
    // Draw main waveform with glow effect
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;
    
    // Create gradient for the waveform
    const waveformGradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    waveformGradient.addColorStop(0, '#32ff7e');
    waveformGradient.addColorStop(0.5, '#00ff88');
    waveformGradient.addColorStop(1, '#32ff7e');
    
    // Draw glow effect first
    canvasCtx.shadowColor = '#32ff7e';
    canvasCtx.shadowBlur = 15;
    canvasCtx.strokeStyle = waveformGradient;
    canvasCtx.lineWidth = 4;
    canvasCtx.beginPath();
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    canvasCtx.stroke();
    
    // Draw inner waveform
    canvasCtx.shadowBlur = 0;
    canvasCtx.strokeStyle = '#ffffff';
    canvasCtx.lineWidth = 2;
    canvasCtx.beginPath();
    x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    canvasCtx.stroke();
    
    // Draw frequency spectrum bars at the bottom
    const freqData = new Uint8Array(track.analyserNode.frequencyBinCount);
    track.analyserNode.getByteFrequencyData(freqData);
    
    const barWidth = canvas.width / freqData.length;
    canvasCtx.fillStyle = 'rgba(50, 255, 126, 0.6)';
    
    for (let i = 0; i < freqData.length; i++) {
        const barHeight = (freqData[i] / 255) * (canvas.height * 0.3);
        canvasCtx.fillRect(
            i * barWidth, 
            canvas.height - barHeight, 
            barWidth - 1, 
            barHeight
        );
    }
    
    track.visualizationId = requestAnimationFrame(() => drawWaveform(trackId));
};

// Add upload functionality
const uploadAudio = async (trackId, file) => {
    const track = tracks[trackId];
    if (!track) return;
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        track.audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        updateTrackState(trackId, 'stopped');
        showMessage(`Track ${trackId} loaded: ${file.name}`, 'success');
        // Initialize in/out editor after audio is loaded
        if (window.ui && window.ui.setupInOutEditor) {
            window.ui.setupInOutEditor(trackId);
        }
    } catch (error) {
        console.error('Error loading audio file:', error);
        showMessage(`Error loading audio file: ${file.name}`, 'error');
    }
};

// Add speed control function
const updateTrackSpeed = (trackId, newSpeed) => {
    const track = tracks[trackId];
    if (!track) return;
    const wasZero = track.speed === 0;
    const wasPlaying = track.state === 'playing';
    track.speed = newSpeed;
    // If speed is 0, stop playback and set state to 'stopped'
    if (newSpeed === 0) {
        stopLoop(trackId);
        track.state = 'stopped';
        if (window.ui && window.ui.updateTrackState) window.ui.updateTrackState(trackId, 'stopped');
    } else if (track.audioBuffer && track.state !== 'playing') {
        // If speed goes above 0 and track has audio and is not playing, start playback
        playLoop(trackId);
        track.state = 'playing';
        if (window.ui && window.ui.updateTrackState) window.ui.updateTrackState(trackId, 'playing');
    } else if (wasPlaying && newSpeed > 0 && track.playingSource) {
        // If already playing, just update speed
        playLoop(trackId);
    }
    // Update the speed display
    const speedValue = document.querySelector(`[data-track-id="${trackId}"].speed-value`);
    if (speedValue) {
        const speedText = `${newSpeed.toFixed(1)}x`;
        speedValue.textContent = speedText;
    }
};

// --- In/Out Point Support ---
function playFromInPoint(trackId) {
    const track = tracks[trackId];
    if (!track.audioBuffer || !track.mainGain) return;
    stopLoop(trackId);
    // Do not play if speed is 0
    if (track.speed === 0) return;
    track.playingSource = audioContext.createBufferSource();
    track.playingSource.buffer = track.audioBuffer;
    track.playingSource.loop = true;
    // Use in/out points
    const inPoint = track.inPoint || 0;
    const outPoint = track.outPoint || track.audioBuffer.duration;
    track.playingSource.loopStart = inPoint;
    track.playingSource.loopEnd = outPoint;
    track.playingSource.playbackRate.value = track.speed;
    setupEffectRouting(trackId);
    track.playingSource.start(0, inPoint);
    if(track.visualizationId) cancelAnimationFrame(track.visualizationId);
    drawWaveform(trackId);
}

// Export functions for use in other modules
window.audioEngine = {
    initAudio,
    tracks,
    updateTrackState,
    clearTrack,
    setupEffectRouting,
    showMessage,
    startRecording,
    stopRecording,
    stopLoop,
    playLoop,
    updateMemoryDisplay,
    uploadAudio,
    updateTrackSpeed,
    playFromInPoint
};

// Export audioContext for other modules
window.audioContext = audioContext;

// Also export as a getter to ensure it's always current
Object.defineProperty(window, 'audioContext', {
    get: () => audioContext,
    set: (value) => { audioContext = value; }
}); 