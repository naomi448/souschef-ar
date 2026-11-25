const fs = require('fs');
const path = require('path');
const audio = require('C:/Users/indry/.codex/plugins/cache/ls-extensions/ls-clad/1.1.0/skills/build-sfx/tools');
const PROJECT_ASSETS_SFX = 'C:/Users/indry/OneDrive/Documents/SousChefAR/Assets/GeneratedSFX';
fs.mkdirSync(PROJECT_ASSETS_SFX, { recursive: true });
const preset = audio.sfx_presets.uiNotify();
const length = Math.floor(0.85 * audio.SAMPLE_RATE);
const result = {left: preset.left.slice(0, length), right: preset.right.slice(0, length)};
for (const channel of [result.left, result.right]) {
  audio.highPass2(channel, 100);
  audio.lowPass2(channel, 3800);
  audio.fadeIn(channel, 0.012);
  audio.fadeOut(channel, 0.18);
}
audio.mix_bus.masterChain(result, {normalize: 'peak', peakCeiling: 0.32});
const output = path.join(PROJECT_ASSETS_SFX, 'TimerDoneChime.wav');
audio.WavBuilder.write(result, output);
let peak = 0;
for (const channel of [result.left, result.right]) for (const v of channel) peak = Math.max(peak, Math.abs(v));
const bytes = fs.readFileSync(output);
if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE' || bytes.length < 44) throw new Error('Invalid WAV');
console.log(JSON.stringify({output, duration_s: result.left.length / audio.SAMPLE_RATE, peak_db: 20 * Math.log10(peak), bytes: bytes.length, sample_rate: bytes.readUInt32LE(24), channels: bytes.readUInt16LE(22)}));
