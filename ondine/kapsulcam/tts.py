"""Speaks one French line with Edge TTS into an mp3, through the host Jour 7 uses since the October 2026 403.

Usage: python tts.py <out.mp3> <text> [voice] [rate]
"""

import asyncio
import sys
import time

import edge_tts
import edge_tts.communicate as communicate
import edge_tts.constants as constants

communicate.WSS_URL = (
    "wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1?Ocp-Apim-Subscription-Key="
    + constants.TRUSTED_CLIENT_TOKEN
)


async def speak(text, voice, rate, path):
    await edge_tts.Communicate(text, voice, rate=rate).save(path)


out, text = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "fr-FR-RemyMultilingualNeural"
rate = sys.argv[4] if len(sys.argv) > 4 else "+8%"
for attempt in range(8):
    try:
        asyncio.run(speak(text, voice, rate, out))
        break
    except Exception as error:
        if "429" not in str(error) or attempt == 7:
            raise
        time.sleep(4 * (attempt + 1))
