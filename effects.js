// Effects Module - Reliable Audio Effects Library

// --- Advanced Effect Creators ---

// Distortion curve generator
function makeDistortionCurve(amount = 50) {
    const n_samples = 44100, curve = new Float32Array(n_samples), deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i ) {
        const x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + amount ) * x * 20 * deg / ( Math.PI + amount * Math.abs(x) );
    }
    return curve;
}

// Phaser effect
function createPhaser() {
    const audioCtx = window.audioContext || audioContext;
    const phaser = audioCtx.createBiquadFilter();
    phaser.type = 'allpass'; 
    phaser.lfo = audioCtx.createOscillator();
    phaser.lfo.type = 'sine'; 
    phaser.lfoGain = audioCtx.createGain();
    phaser.lfo.connect(phaser.lfoGain).connect(phaser.frequency);
    phaser.lfo.start();
    return phaser;
}

// Flanger effect - FIXED ROUTING
function createFlanger() {
    const audioCtx = window.audioContext || audioContext;
    const flanger = audioCtx.createDelay(0.02);
    flanger.lfo = audioCtx.createOscillator();
    flanger.lfo.type = 'sine';
    flanger.lfoGain = audioCtx.createGain();
    flanger.feedback = audioCtx.createGain();
    
    // FIXED: Proper flanger routing
    flanger.lfo.connect(flanger.lfoGain);
    flanger.lfoGain.connect(flanger.delayTime);
    flanger.connect(flanger.feedback);
    flanger.feedback.connect(flanger);
    
    // Set initial values
    flanger.lfo.frequency.value = 0.5;
    flanger.lfoGain.gain.value = 0.005;
    flanger.feedback.gain.value = 0.3;
    
    flanger.lfo.start();
    return flanger;
}

// Chorus effect
function createChorus() {
    const audioCtx = window.audioContext || audioContext;
    const chorus = audioCtx.createDelay(0.05);
    chorus.lfo = audioCtx.createOscillator();
    chorus.lfo.type = 'sine';
    chorus.lfoGain = audioCtx.createGain();
    
    // Set up the chorus routing
    chorus.lfo.connect(chorus.lfoGain);
    chorus.lfoGain.connect(chorus.delayTime);
    
    // Set initial values
    chorus.lfo.frequency.value = 1.5;
    chorus.lfoGain.gain.value = 0.01;
    
    chorus.lfo.start();
    return chorus;
}

// Lo-Fi effect (lowpass filter with some character)
function createLoFi() {
    const audioCtx = window.audioContext || audioContext;
    const loFi = audioCtx.createBiquadFilter();
    loFi.type = 'lowpass';
    loFi.frequency.value = 2000;
    loFi.Q.value = 1;
    return loFi;
}

// Tape Echo effect - FIXED ROUTING
function createTapeEcho() {
    const audioCtx = window.audioContext || audioContext;
    const tapeEcho = audioCtx.createDelay(1.0);
    tapeEcho.feedback = audioCtx.createGain();
    
    // FIXED: Proper tape echo routing
    tapeEcho.connect(tapeEcho.feedback);
    tapeEcho.feedback.connect(tapeEcho);
    
    // Set initial values
    tapeEcho.feedback.gain.value = 0.3;
    
    return tapeEcho;
}

// Slicer effect (rhythmic gating)
function createSlicer() {
    const audioCtx = window.audioContext || audioContext;
    const slicer = audioCtx.createGain();
    slicer.lfo = audioCtx.createOscillator();
    slicer.lfo.type = 'square';
    slicer.lfo.frequency.value = 2;
    slicer.lfoGain = audioCtx.createGain();
    slicer.lfo.connect(slicer.lfoGain);
    slicer.lfoGain.connect(slicer.gain);
    slicer.lfo.start();
    return slicer;
}

// Vinyl Flick effect (amplitude modulation)
function createVinylFlick() {
    const audioCtx = window.audioContext || audioContext;
    const vinylFlick = audioCtx.createGain();
    vinylFlick.lfo = audioCtx.createOscillator();
    vinylFlick.lfo.type = 'sine';
    vinylFlick.lfo.frequency.value = 0.1;
    vinylFlick.lfoGain = audioCtx.createGain();
    vinylFlick.lfo.connect(vinylFlick.lfoGain);
    vinylFlick.lfoGain.connect(vinylFlick.gain);
    vinylFlick.lfo.start();
    return vinylFlick;
}

// Reverb effect
function createReverb() {
    const audioCtx = window.audioContext || audioContext;
    return audioCtx.createConvolver();
}

// Filter effect (lowpass)
function createFilter() {
    const audioCtx = window.audioContext || audioContext;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;
    return filter;
}

// Lowpass filter
function createLowpass() {
    const audioCtx = window.audioContext || audioContext;
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1000;
    lowpass.Q.value = 1;
    return lowpass;
}

// Highpass filter
function createHighpass() {
    const audioCtx = window.audioContext || audioContext;
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1000;
    highpass.Q.value = 1;
    return highpass;
}

// Bandpass filter
function createBandpass() {
    const audioCtx = window.audioContext || audioContext;
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000;
    bandpass.Q.value = 1;
    return bandpass;
}

// Isolator effect (frequency isolation)
function createIsolator() {
    const audioCtx = window.audioContext || audioContext;
    const isolator = audioCtx.createBiquadFilter();
    isolator.type = 'bandpass';
    isolator.frequency.value = 1000;
    isolator.Q.value = 10;
    return isolator;
}

// EQ effect (parametric)
function createEQ() {
    const audioCtx = window.audioContext || audioContext;
    const eq = audioCtx.createBiquadFilter();
    eq.type = 'peaking';
    eq.frequency.value = 1000;
    eq.Q.value = 1;
    eq.gain.value = 0;
    return eq;
}

// Compressor effect
function createCompressor() {
    const audioCtx = window.audioContext || audioContext;
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    return compressor;
}

// Pan effect
function createPan() {
    const audioCtx = window.audioContext || audioContext;
    return audioCtx.createStereoPanner();
}

// Delay effect
function createDelay() {
    const audioCtx = window.audioContext || audioContext;
    return audioCtx.createDelay(5.0);
}

// Tremolo effect
function createTremolo() {
    const audioCtx = window.audioContext || audioContext;
    return audioCtx.createGain();
}

// Distortion effect
function createDistortion() {
    const audioCtx = window.audioContext || audioContext;
    const distortion = audioCtx.createWaveShaper();
    distortion.curve = makeDistortionCurve(400);
    return distortion;
}

// Effect parameter mapping function with combination support
function applyEffectParameter(effectNode, effectType, amount, instanceCount = 1) {
    if (!effectNode) return;
    
    const audioCtx = window.audioContext || audioContext;
    const currentTime = audioCtx.currentTime;
    
    // For multiple instances of the same effect, combine the parameters
    const combinedAmount = Math.min(1, amount * instanceCount);
    
    // Each effect has a clear, primary parameter controlled by the dial
    switch (effectType) {
        case 'lowpass':
        case 'highpass':
        case 'bandpass':
        case 'filter':
        case 'loFi':
        case 'isolator':
            // Filter frequency: 40Hz to 20kHz
            const min = 40, max = audioCtx.sampleRate / 2;
            effectNode.frequency.setTargetAtTime(
                Math.exp(Math.log(min) + (Math.log(max) - Math.log(min)) * combinedAmount), 
                currentTime, 
                0.01
            );
            break;
            
        case 'eq':
            // EQ gain: -10dB to +10dB
            effectNode.gain.setTargetAtTime(combinedAmount * 20 - 10, currentTime, 0.01);
            break;
            
        case 'phaser':
            // Phaser modulation depth: 0 to 2000Hz
            effectNode.lfoGain.gain.setTargetAtTime(combinedAmount * 2000, currentTime, 0.01);
            break;
            
        case 'distortion':
            // Distortion amount: 0 to 800
            effectNode.curve = makeDistortionCurve(combinedAmount * 800);
            break;
            
        case 'delay':
        case 'tapeEcho':
            // Delay time: 0 to 2 seconds
            effectNode.delayTime.setTargetAtTime(combinedAmount * 2, currentTime, 0.01);
            break;
            
        case 'panner':
            // Pan position: -1 (left) to +1 (right)
            effectNode.pan.setTargetAtTime(combinedAmount * 2 - 1, currentTime, 0.01);
            break;
            
        case 'tremolo':
            // Tremolo depth: 0 to 1
            effectNode.gain.setTargetAtTime(1 - combinedAmount, currentTime, 0.01);
            break;
            
        case 'flanger':
            // Flanger modulation depth: 0 to 0.01
            effectNode.lfoGain.gain.setTargetAtTime(combinedAmount * 0.01, currentTime, 0.01);
            // Also control feedback: 0 to 0.8
            effectNode.feedback.gain.setTargetAtTime(combinedAmount * 0.8, currentTime, 0.01);
            break;
            
        case 'chorus':
            // Chorus modulation depth: 0 to 0.02
            effectNode.lfoGain.gain.setTargetAtTime(combinedAmount * 0.02, currentTime, 0.01);
            break;
            
        case 'compressor':
            // Compressor threshold: -60 to -20 dB
            effectNode.threshold.setTargetAtTime(-60 + combinedAmount * 40, currentTime, 0.01);
            break;
            
        case 'slicer':
            // Slicer gate depth: 0 to 0.8
            effectNode.lfoGain.gain.setTargetAtTime(combinedAmount * 0.8, currentTime, 0.01);
            break;
            
        case 'vinylFlick':
            // Vinyl flick depth: 0 to 0.5
            effectNode.lfoGain.gain.setTargetAtTime(combinedAmount * 0.5, currentTime, 0.01);
            break;
            
        case 'reverb':
            // Reverb wet/dry mix: 0 to 1
            if (effectNode.wet && effectNode.dry) {
                effectNode.wet.gain.setTargetAtTime(combinedAmount, currentTime, 0.01);
                effectNode.dry.gain.setTargetAtTime(1 - combinedAmount, currentTime, 0.01);
            }
            break;
            
        default:
            // For any other effects, use volume control as fallback
            if (effectNode.gain) {
                effectNode.gain.setTargetAtTime(0.1 + combinedAmount * 0.9, currentTime, 0.01);
            }
            break;
    }
}

// Export functions for use in other modules
window.effects = {
    makeDistortionCurve,
    createPhaser,
    createFlanger,
    createChorus,
    createLoFi,
    createTapeEcho,
    createSlicer,
    createVinylFlick,
    createReverb,
    createFilter,
    createLowpass,
    createHighpass,
    createBandpass,
    createIsolator,
    createEQ,
    createCompressor,
    createPan,
    createDelay,
    createTremolo,
    createDistortion,
    applyEffectParameter
}; 