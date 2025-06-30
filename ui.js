// UI Module - User interface generation and event handling

// --- UI Generation ---
const effectOptions = [
    'none', 
    'reverb', 
    'delay', 
    'tapeEcho', 
    'chorus', 
    'flanger', 
    'phaser', 
    'tremolo', 
    'distortion', 
    'loFi', 
    'eq', 
    'compressor', 
    'panner', 
    'filter', 
    'lowpass', 
    'highpass', 
    'bandpass', 
    'slicer', 
    'isolator', 
    'vinylFlick'
];

const createDialMarkings = () => {
    let svg = `<svg class="dial-markings" viewBox="0 0 100 100">`;
    const radius = 42; 
    const center = 50;
    for(let i = 0; i <= 10; i++) {
        const angleDeg = (i / 10) * 270 - 135;
        const angleRad = angleDeg * (Math.PI / 180);
        const isMajor = i % 2 === 0;
        const tickLength = isMajor ? 6 : 4;
        const x1 = center + (radius - 5) * Math.cos(angleRad - Math.PI/2), 
              y1 = center + (radius - 5) * Math.sin(angleRad - Math.PI/2);
        const x2 = center + (radius - tickLength - 5) * Math.cos(angleRad - Math.PI/2), 
              y2 = center + (radius - tickLength - 5) * Math.sin(angleRad - Math.PI/2);
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="1.5"/>`;
        if(isMajor) {
            const textX = center + (radius + 2) * Math.cos(angleRad - Math.PI/2);
            const textY = center + (radius + 2) * Math.sin(angleRad - Math.PI/2);
            svg += `<text x="${textX}" y="${textY}" font-size="8" fill="#333" text-anchor="middle" dominant-baseline="central" font-family="Roboto Mono">${i}</text>`;
        }
    }
    return svg + `</svg>`;
};

const createLoopTrackUI = (trackId) => {
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const track = tracks[trackId] || { fx: [{ type: 'none', angle: -135 }, { type: 'none', angle: -135 }, { type: 'none', angle: -135 }] };
    return `
    <div id="track-${trackId}" class="track-container flex flex-col items-center space-y-4 bg-[#d1d0c9] p-4 rounded-lg border-t-2 border-l-2 border-gray-100 border-b-2 border-r-2 border-gray-400 shadow-lg">
        <div class="led-container">
            <span class="label text-xl">${trackId}</span>
            <div class="retro-led${track.audioBuffer ? ' ready' : ''}" id="led-${trackId}"></div>
        </div>
        <canvas id="vis-canvas-${trackId}" class="waveform-canvas"></canvas>
        <!-- In/Out Point Editor -->
        <div class="w-full flex flex-col items-center mt-2">
            <div class="relative w-full max-w-xs h-10 rounded overflow-hidden ${track.audioBuffer ? 'bg-gray-200 border border-gray-400' : 'inout-editor-container'}">
                <div id="inout-bar-${trackId}" class="absolute top-0 left-0 h-full w-full" style="z-index:1;"></div>
                <div id="in-handle-${trackId}" class="absolute top-0 left-0 w-2 h-full cursor-ew-resize" style="z-index:2;"></div>
                <div id="out-handle-${trackId}" class="absolute top-0 right-0 w-2 h-full cursor-ew-resize" style="z-index:2;"></div>
            </div>
            <div class="flex justify-between w-full max-w-xs text-xs mt-1">
                <span>In: <span id="in-time-${trackId}">0.00s</span></span>
                <span>Out: <span id="out-time-${trackId}">0.00s</span></span>
            </div>
        </div>
        <div class="w-full flex justify-around items-center pt-2">
            <div class="flex flex-col items-center">
                <div class="fader-track" data-track-id="${trackId}" data-control="volume"><div class="fader-handle"></div></div>
                <span class="label mt-1">Volume</span>
            </div>
            <div class="loop-button-container" data-track-id="${trackId}" data-action="loop">
                <div class="loop-button-ring loop-button-outer-ring"></div>
                <div class="loop-button-ring loop-button-center"><i class="fas fa-microphone text-[#32ff7e]"></i></div>
            </div>
        </div>
        <div class="w-full grid grid-cols-3 gap-2 mt-2 px-1">
            ${track.fx.map((fx, index) => `
                <div class="flex flex-col items-center space-y-1">
                    <select class="effect-select" data-track-id="${trackId}" data-action="set-effect" data-fx-index="${index}">
                        ${effectOptions.map(opt => `<option value="${opt}" ${fx.type === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                    <div class="knob-container" data-track-id="${trackId}" data-control="fx-amount" data-fx-index="${index}">
                         ${createDialMarkings()}
                        <div class="knob-base"><div class="knob-indicator"></div></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="w-full flex flex-col space-y-2">
            <div class="flex flex-col items-center space-y-1">
                <div class="speed-slider-track" data-track-id="${trackId}" data-control="speed">
                    <div class="speed-slider-handle"></div>
                    <div class="speed-slider-markings">
                        <div class="marking marking-0">0</div>
                        <div class="marking marking-1">1</div>
                        <div class="marking marking-2">2</div>
                    </div>
                </div>
                <div class="speed-value text-xs text-center" data-track-id="${trackId}">1.0x</div>
                <span class="label text-xs">Speed</span>
            </div>
        </div>
        <div class="flex space-x-2 w-full justify-around items-center pt-2">
            <button class="control-button text-sm px-4 py-2" data-track-id="${trackId}" data-action="mute" title="Mute">
                <i class="fas fa-volume-mute"></i>
            </button>
            <button class="control-button upload-button text-sm px-4 py-2" data-track-id="${trackId}" data-action="upload" title="Upload Audio">
                <i class="fas fa-upload"></i>
            </button>
            <button class="control-button red-button text-sm px-4 py-2" data-track-id="${trackId}" data-action="clear" title="Clear Track">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <input type="file" id="upload-${trackId}" class="hidden" accept="audio/*" data-track-id="${trackId}">
    </div>`;
};

function renderTracks() {
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const container = document.getElementById('loop-tracks-container');
    container.innerHTML = '';
    for (let i = 1; i <= 6; i++) container.innerHTML += createLoopTrackUI(i);
    for (let i = 1; i <= 6; i++) {
        const track = tracks[i];
        if (!track) continue;
        const container = document.getElementById(`track-${i}`);
        if (!container) continue;
        
        // Initialize volume fader
        const faderTrack = container.querySelector('[data-control="volume"]');
        if (faderTrack) {
            const handle = faderTrack.querySelector('.fader-handle');
            if (handle) {
                handle.style.bottom = `${(faderTrack.offsetHeight - handle.offsetHeight) * track.volume}px`;
            }
        }
        
        // Initialize effect knobs
        track.fx.forEach((fx, index) => {
            const knob = container.querySelector(`[data-control="fx-amount"][data-fx-index="${index}"] .knob-indicator`);
            if (knob) {
                knob.style.transform = `translateX(-50%) rotate(${fx.angle}deg)`;
            }
        });
        
        // Initialize speed slider
        const speedSliderTrack = container.querySelector('[data-control="speed"]');
        if (speedSliderTrack) {
            const handle = speedSliderTrack.querySelector('.speed-slider-handle');
            if (handle) {
                requestAnimationFrame(() => {
                    const trackWidth = speedSliderTrack.offsetWidth;
                    const handleWidth = handle.offsetWidth;
                    const speed = track.speed || 1.0;
                    // Map speed (0-2) to position (0-100%)
                    const position = (trackWidth - handleWidth) * (speed / 2);
                    handle.style.left = `${position}px`;

                    // Update speed display
                    const speedValue = container.querySelector('.speed-value');
                    if (speedValue) {
                        const speedText = `${speed.toFixed(1)}x`;
                        speedValue.textContent = speedText;
                    }
                });
            }
        }
    }
}

// --- Event Handling ---
function handleLoopButtonPress(trackId) {
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const stopRecording = window.audioEngine ? window.audioEngine.stopRecording : () => {};
    const updateTrackState = window.audioEngine ? window.audioEngine.updateTrackState : () => {};
    
    const track = tracks[trackId];
    if (!track) return;
    
    const state = track.state;
    const transitions = { 'empty': 'recording', 'recording': 'playing', 'playing': 'stopped', 'stopped': 'playing' };
    if(state === 'recording') { 
        stopRecording(trackId); 
        return; 
    }
    if(state === 'stopped' && !track.audioBuffer) return;
    updateTrackState(trackId, transitions[state]);
}

async function handleUiClick(target) {
    if (!target || !target.dataset.action) return;
    
    const initAudio = window.audioEngine ? window.audioEngine.initAudio : async () => false;
    const clearTrack = window.audioEngine ? window.audioEngine.clearTrack : () => {};
    const setupEffectRouting = window.audioEngine ? window.audioEngine.setupEffectRouting : () => {};
    
    if (!await initAudio()) return;
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const trackId = target.dataset.trackId, action = target.dataset.action;
    if (action === 'loop') handleLoopButtonPress(trackId);
    else if (action === 'clear') clearTrack(trackId);
    else if (action === 'upload') {
        const fileInput = document.getElementById(`upload-${trackId}`);
        if (fileInput) fileInput.click();
    }
    else if (action === 'mute') {
        const track = tracks[trackId];
        if (!track) return;
        track.isMuted = !track.isMuted;
        if(track.analyserNode) {
            track.analyserNode.disconnect();
            if(!track.isMuted) track.analyserNode.connect(window.audioContext.destination);
        }
        target.classList.toggle('active', track.isMuted);
        
        // Update LED state for mute
        const led = document.getElementById(`led-${trackId}`);
        if (led) {
            if (track.isMuted) {
                led.classList.remove('ready', 'recording', 'playing');
                led.classList.add('muted');
            } else {
                led.classList.remove('muted');
                // Restore previous state
                if (track.state === 'recording') led.classList.add('recording');
                else if (track.state === 'playing') led.classList.add('playing');
                else led.classList.add('ready');
            }
        }
    }
    else if(action === 'set-effect'){
        const track = tracks[trackId];
        if (!track) return;
        const fxIndex = target.dataset.fxIndex;
        track.fx[fxIndex].type = target.value;
        setupEffectRouting(trackId);
    }
}

function updateTrackState(trackId, newState) {
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const stopLoop = window.audioEngine ? window.audioEngine.stopLoop : () => {};
    const startRecording = window.audioEngine ? window.audioEngine.startRecording : () => {};
    const playLoop = window.audioEngine ? window.audioEngine.playLoop : () => {};
    
    const track = tracks[trackId];
    if (!track) return;
    
    track.state = newState;
    const container = document.getElementById(`track-${trackId}`);
    if (!container) return;
    
    const loopButton = container.querySelector('.loop-button-container');
    if (!loopButton) return;
    
    const icon = loopButton.querySelector('i');
    if (!icon) return;
    
    // Update LED state
    const led = document.getElementById(`led-${trackId}`);
    if (led) {
        led.classList.remove('ready', 'recording', 'playing', 'muted');
    }
    
    loopButton.classList.remove('recording', 'playing', 'stopped');
    icon.className = '';
    switch (newState) {
        case 'empty': 
            icon.className = 'fas fa-microphone text-[#32ff7e]'; 
            // LED OFF if no audioBuffer
            if (led) {
                led.classList.remove('ready', 'recording', 'playing', 'muted');
            }
            stopLoop(trackId); 
            container.style.borderColor = '#5a5a5a'; 
            break;
        case 'recording': 
            loopButton.classList.add('recording'); 
            icon.className = 'fas fa-stop text-white'; 
            if (led) led.classList.add('recording');
            container.style.borderColor = '#ff4757'; 
            startRecording(trackId); 
            break;
        case 'playing': 
            loopButton.classList.add('playing'); 
            icon.className = 'fas fa-pause text-white'; 
            if (led) led.classList.add('playing');
            container.style.borderColor = '#32ff7e'; 
            playLoop(trackId); 
            break;
        case 'stopped': 
            loopButton.classList.add('stopped'); 
            icon.className = 'fas fa-play text-[#32ff7e]'; 
            // LED ON only if track has audio loaded
            if (track.audioBuffer) {
                if (led) led.classList.add('ready');
                container.style.borderColor = '#32ff7e';
            } else {
                if (led) led.classList.remove('ready', 'recording', 'playing', 'muted');
                container.style.borderColor = '#888';
            }
            stopLoop(trackId); 
            break;
    }
}

// --- Drag Handling ---
let dragTarget = null, startY, startX, startValue;

async function handleDragStart(e) {
    const targetControl = e.target.closest('[data-control]');
    if (!targetControl) return;
    e.preventDefault(); 
    
    const initAudio = window.audioEngine ? window.audioEngine.initAudio : async () => false;
    if (!await initAudio()) return;
    
    dragTarget = targetControl;
    startY = (e.type === 'touchstart' ? e.touches[0] : e).clientY;
    startX = (e.type === 'touchstart' ? e.touches[0] : e).clientX;
    
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const trackId = targetControl.dataset.trackId, track = tracks[trackId];
    if (!track) return;
    
    const controlType = targetControl.dataset.control;
    if (controlType === 'volume') {
        const faderTrack = targetControl, handle = faderTrack.querySelector('.fader-handle');
        if (!handle) return;
        startValue = (faderTrack.offsetHeight - handle.offsetHeight) * track.volume;
    } else if (controlType === 'fx-amount') {
        const fxIndex = targetControl.dataset.fxIndex;
        if (!track.fx[fxIndex]) return;
        startValue = track.fx[fxIndex].angle;
    } else if (controlType === 'speed') {
        const speedSliderTrack = targetControl;
        const handle = speedSliderTrack.querySelector('.speed-slider-handle');
        if (!handle) return;
        const trackWidth = speedSliderTrack.offsetWidth;
        const handleWidth = handle.offsetWidth;
        startValue = (trackWidth - handleWidth) * (track.speed / 2); // Convert speed to position
    }
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
}

function handleDragMove(e) {
    if (!dragTarget) return;
    e.preventDefault();
    const clientY = (e.type === 'touchmove' ? e.touches[0] : e).clientY;
    const clientX = (e.type === 'touchmove' ? e.touches[0] : e).clientX;
    const diffY = startY - clientY;
    const diffX = clientX - startX;
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const trackId = dragTarget.dataset.trackId, track = tracks[trackId];
    if (!track) return;
    
    const controlType = dragTarget.dataset.control;
    if (controlType === 'volume') {
        const faderTrack = dragTarget, handle = faderTrack.querySelector('.fader-handle');
        if (!handle) return;
        const trackHeight = faderTrack.offsetHeight, handleHeight = handle.offsetHeight;
        let newBottom = Math.max(0, Math.min(trackHeight - handleHeight, startValue + diffY));
        handle.style.bottom = `${newBottom}px`;
        track.volume = newBottom / (trackHeight - handleHeight);
        if (track.mainGain) track.mainGain.gain.setValueAtTime(track.volume, window.audioContext.currentTime);
    } else if (controlType === 'fx-amount') {
        const fxIndex = dragTarget.dataset.fxIndex, fxSlot = track.fx[fxIndex];
        if (!fxSlot) return;
        let newAngle = Math.max(-135, Math.min(135, startValue + diffY));
        const knobIndicator = dragTarget.querySelector('.knob-indicator');
        if (knobIndicator) {
            knobIndicator.style.transform = `translateX(-50%) rotate(${newAngle}deg)`;
        }
        fxSlot.angle = newAngle; 
        
        // Handle effect combination for multiple instances of the same effect type
        const effectType = fxSlot.type;
        if (effectType !== 'none') {
            const effectNode = track.nodePool[effectType];
            if (effectNode) {
                // Count instances of this effect type
                const effectCounts = {};
                track.fx.forEach(fx => {
                    if (fx.type !== 'none') {
                        effectCounts[fx.type] = (effectCounts[fx.type] || 0) + 1;
                    }
                });
                
                // Calculate combined parameters from all instances of this effect type
                const totalAmount = track.fx
                    .filter(fx => fx.type === effectType)
                    .reduce((sum, fx) => sum + fx.angle, 0) / track.fx.filter(fx => fx.type === effectType).length;
                
                const normalizedAmount = (totalAmount + 135) / 270; // Convert from -135 to +135 range to 0-1
                
                // Apply combined parameters
                const applyEffectParameter = window.effects ? window.effects.applyEffectParameter : () => {};
                applyEffectParameter(effectNode, effectType, normalizedAmount, effectCounts[effectType]);
            }
        }
    } else if (controlType === 'speed') {
        const speedSliderTrack = dragTarget;
        const handle = speedSliderTrack.querySelector('.speed-slider-handle');
        if (!handle) return;
        
        const trackWidth = speedSliderTrack.offsetWidth;
        const handleWidth = handle.offsetWidth;
        let newLeft = Math.max(0, Math.min(trackWidth - handleWidth, startValue + diffX));
        handle.style.left = `${newLeft}px`;
        
        // Convert position to speed value (0 to 2)
        const normalizedPosition = newLeft / (trackWidth - handleWidth);
        const newSpeed = normalizedPosition * 2; // Convert 0-1 to 0-2
        
        const updateTrackSpeed = window.audioEngine ? window.audioEngine.updateTrackSpeed : () => {};
        updateTrackSpeed(trackId, newSpeed);
    }
}

const handleDragEnd = () => {
    dragTarget = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);
};

// --- In/Out Point Editor Logic ---
function setupInOutEditor(trackId) {
    const tracks = window.audioEngine ? window.audioEngine.tracks : {};
    const track = tracks[trackId];
    if (!track || !track.audioBuffer) return;
    if (track.inPoint === undefined) track.inPoint = 0;
    if (track.outPoint === undefined) track.outPoint = track.audioBuffer.duration;

    const bar = document.getElementById(`inout-bar-${trackId}`);
    const inHandle = document.getElementById(`in-handle-${trackId}`);
    const outHandle = document.getElementById(`out-handle-${trackId}`);
    const inTime = document.getElementById(`in-time-${trackId}`);
    const outTime = document.getElementById(`out-time-${trackId}`);

    // Add oscilloscope theme classes
    bar.classList.add('inout-editor-bar');
    inHandle.classList.add('inout-handle');
    outHandle.classList.add('inout-handle', 'out');

    // Add grid lines
    let grid = bar.querySelector('.inout-editor-grid');
    if (!grid) {
        grid = document.createElement('div');
        grid.className = 'inout-editor-grid';
        for (let i = 1; i < 10; i++) {
            const line = document.createElement('div');
            line.className = 'inout-editor-grid-line';
            line.style.left = `${i * 10}%`;
            grid.appendChild(line);
        }
        bar.appendChild(grid);
    }

    // Add range bar
    let rangeBar = bar.querySelector('.inout-editor-bar-range');
    if (!rangeBar) {
        rangeBar = document.createElement('div');
        rangeBar.className = 'inout-editor-bar-range';
        bar.appendChild(rangeBar);
    }

    // Add waveform canvas
    let waveformCanvas = bar.querySelector('.inout-waveform-canvas');
    if (!waveformCanvas) {
        waveformCanvas = document.createElement('canvas');
        waveformCanvas.className = 'inout-waveform-canvas';
        waveformCanvas.style.position = 'absolute';
        waveformCanvas.style.top = '0';
        waveformCanvas.style.left = '0';
        waveformCanvas.style.width = '100%';
        waveformCanvas.style.height = '100%';
        waveformCanvas.style.zIndex = '0';
        waveformCanvas.style.pointerEvents = 'none';
        bar.appendChild(waveformCanvas);
    }

    // Render waveform in the editor bar
    function renderWaveformInEditor() {
        const canvas = waveformCanvas;
        const ctx = canvas.getContext('2d');
        const rect = bar.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get audio data
        const audioData = track.audioBuffer.getChannelData(0);
        const samplesPerPixel = Math.floor(audioData.length / canvas.width);
        
        // Draw waveform
        ctx.strokeStyle = 'rgba(50, 255, 126, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x++) {
            const startSample = Math.floor(x * samplesPerPixel);
            const endSample = Math.min(startSample + samplesPerPixel, audioData.length);
            
            let sum = 0;
            for (let i = startSample; i < endSample; i++) {
                sum += Math.abs(audioData[i]);
            }
            const average = sum / (endSample - startSample);
            const y = (1 - average) * canvas.height / 2;
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw mirrored waveform
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const startSample = Math.floor(x * samplesPerPixel);
            const endSample = Math.min(startSample + samplesPerPixel, audioData.length);
            
            let sum = 0;
            for (let i = startSample; i < endSample; i++) {
                sum += Math.abs(audioData[i]);
            }
            const average = sum / (endSample - startSample);
            const y = canvas.height - (1 - average) * canvas.height / 2;
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    // Drag logic
    let dragging = null;
    let startX = 0;
    let barRect = null;
    let startInPoint = 0;
    let startOutPoint = 0;
    
    function updateHandles() {
        barRect = bar.getBoundingClientRect();
        const duration = track.audioBuffer.duration;
        const inPct = (track.inPoint / duration) * 100;
        const outPct = (track.outPoint / duration) * 100;
        inHandle.style.left = `calc(${inPct}% - 4px)`;
        outHandle.style.left = `calc(${outPct}% - 4px)`;
        rangeBar.style.left = `${inPct}%`;
        rangeBar.style.width = `${outPct - inPct}%`;
        inTime.textContent = track.inPoint.toFixed(2) + 's';
        outTime.textContent = track.outPoint.toFixed(2) + 's';
    }
    
    function onDrag(e) {
        if (!dragging) return;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let x = Math.max(0, Math.min(clientX - barRect.left, barRect.width));
        const duration = track.audioBuffer.duration;
        const pct = x / barRect.width;
        const time = pct * duration;
        
        if (dragging === 'in') {
            track.inPoint = Math.min(time, track.outPoint - 0.01);
        } else if (dragging === 'out') {
            track.outPoint = Math.max(time, track.inPoint + 0.01);
        } else if (dragging === 'segment') {
            const segmentWidth = startOutPoint - startInPoint;
            const dragOffset = (clientX - startX) / barRect.width * duration;
            const newInPoint = Math.max(0, Math.min(duration - segmentWidth, startInPoint + dragOffset));
            const newOutPoint = newInPoint + segmentWidth;
            track.inPoint = newInPoint;
            track.outPoint = newOutPoint;
        }
        
        updateHandles();
        
        // Real-time update: if track is playing, restart with new in/out points
        if (track.state === 'playing' && window.audioEngine && window.audioEngine.playLoop) {
            window.audioEngine.playLoop(trackId);
        }
    }
    
    function stopDrag() {
        dragging = null;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }
    
    // Handle drag events
    inHandle.onmousedown = (e) => { 
        dragging = 'in'; 
        barRect = bar.getBoundingClientRect(); 
        startX = e.clientX; 
        document.addEventListener('mousemove', onDrag); 
        document.addEventListener('mouseup', stopDrag); 
    };
    outHandle.onmousedown = (e) => { 
        dragging = 'out'; 
        barRect = bar.getBoundingClientRect(); 
        startX = e.clientX; 
        document.addEventListener('mousemove', onDrag); 
        document.addEventListener('mouseup', stopDrag); 
    };
    inHandle.ontouchstart = (e) => { 
        dragging = 'in'; 
        barRect = bar.getBoundingClientRect(); 
        startX = e.touches[0].clientX; 
        document.addEventListener('touchmove', onDrag); 
        document.addEventListener('touchend', stopDrag); 
    };
    outHandle.ontouchstart = (e) => { 
        dragging = 'out'; 
        barRect = bar.getBoundingClientRect(); 
        startX = e.touches[0].clientX; 
        document.addEventListener('touchmove', onDrag); 
        document.addEventListener('touchend', stopDrag); 
    };
    
    // Add segment dragging from the middle
    rangeBar.onmousedown = (e) => {
        dragging = 'segment';
        barRect = bar.getBoundingClientRect();
        startX = e.clientX;
        startInPoint = track.inPoint;
        startOutPoint = track.outPoint;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    };
    rangeBar.ontouchstart = (e) => {
        dragging = 'segment';
        barRect = bar.getBoundingClientRect();
        startX = e.touches[0].clientX;
        startInPoint = track.inPoint;
        startOutPoint = track.outPoint;
        document.addEventListener('touchmove', onDrag);
        document.addEventListener('touchend', stopDrag);
    };

    // Initial render and setup
    renderWaveformInEditor();
    updateHandles();
}

// Patch renderTracks to call setupInOutEditor after rendering
const origRenderTracks = renderTracks;
renderTracks = function() {
    origRenderTracks();
    for (let i = 1; i <= 6; i++) setupInOutEditor(i);
};

// Export functions for use in other modules
window.ui = {
    handleUiClick,
    handleDragStart,
    renderTracks,
    updateTrackState,
    setupInOutEditor
}; 