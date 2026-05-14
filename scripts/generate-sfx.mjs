/**
 * Generate placeholder SFX WAV files for the penalty game.
 * These are short, programmatic sounds — replace with real SFX later.
 * 
 * Usage: node scripts/generate-sfx.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT_DIR = 'public/sfx';
mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 22050;

function generateWav(samples) {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * 2; // 16-bit mono
  const blockAlign = 2;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(1, 22);  // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 30);
  buffer.writeUInt16LE(16, 32); // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
  }

  return buffer;
}

// --- Kick: short punchy thump (0.15s) ---
function makeKick() {
  const duration = 0.15;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 150 * Math.exp(-t * 30); // descending pitch
    const envelope = Math.exp(-t * 25);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.9;
    // Add noise hit
    samples[i] += (Math.random() * 2 - 1) * Math.exp(-t * 60) * 0.4;
  }
  return samples;
}

// --- Goal: ascending happy tone + crowd burst (0.6s) ---
function makeGoal() {
  const duration = 0.6;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Rising chord
    const f1 = 440 + t * 300;
    const f2 = 554 + t * 300;
    const f3 = 659 + t * 300;
    const envelope = Math.min(1, t * 20) * Math.exp(-t * 2);
    samples[i] = (Math.sin(2 * Math.PI * f1 * t) * 0.3 +
                  Math.sin(2 * Math.PI * f2 * t) * 0.3 +
                  Math.sin(2 * Math.PI * f3 * t) * 0.3) * envelope;
    // Crowd noise
    samples[i] += (Math.random() * 2 - 1) * 0.15 * Math.min(1, t * 5) * Math.exp(-t * 1.5);
  }
  return samples;
}

// --- Save: dull thud + short whistle (0.3s) ---
function makeSave() {
  const duration = 0.3;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Glove thump
    const thump = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 15) * 0.6;
    // Short buzz
    const buzz = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 8) * 0.3;
    samples[i] = thump + buzz;
  }
  return samples;
}

// --- Miss: descending "womp" (0.4s) ---
function makeMiss() {
  const duration = 0.4;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Descending tone
    const freq = 300 * Math.exp(-t * 3);
    const envelope = Math.exp(-t * 4);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.6;
    // Whistle
    samples[i] += Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.2;
  }
  return samples;
}

const sfx = [
  { name: 'kick.wav', gen: makeKick },
  { name: 'goal.wav', gen: makeGoal },
  { name: 'save.wav', gen: makeSave },
  { name: 'miss.wav', gen: makeMiss },
];

for (const { name, gen } of sfx) {
  const samples = gen();
  const wav = generateWav(samples);
  const outPath = join(OUT_DIR, name);
  writeFileSync(outPath, wav);
  console.log(`✓ ${name} (${wav.length} bytes)`);
}

console.log('\nDone! Replace these with real SFX from mixkit.co when available.');
