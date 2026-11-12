# python transcrire.py <video.mp4> : French transcription with word timings (faster-whisper, CPU), to place the captions on the spoken words
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0

model = WhisperModel("small", device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio, language="fr", word_timestamps=True, vad_filter=False)
for seg in segments:
    words = " ".join(f"{w.word.strip()}[{w.start:.2f}-{w.end:.2f}]" for w in seg.words)
    print(f"{seg.start:.2f}-{seg.end:.2f} | {seg.text.strip()} | {words}")
