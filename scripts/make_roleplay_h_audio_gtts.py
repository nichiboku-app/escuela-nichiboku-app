from gtts import gTTS
from pathlib import Path

# Genera MP3s para Roleplay H
DEST = Path("assets/audio/n5/roleplayH")
DEST.mkdir(parents=True, exist_ok=True)

items = [
    ("konnichiwa.mp3", "こんにちは。"),
    ("ohayo_gozaimasu.mp3", "おはよう ございます。"),
    ("hajimemashite_yoroshiku.mp3", "はじめまして。 よろしく おねがいします。"),
]

for filename, text in items:
    out = DEST / filename
    print(" Generando", out)
    tts = gTTS(text=text, lang="ja", slow=False)
    tts.save(str(out))

print(" Listo. Archivos en:", DEST)
