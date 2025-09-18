from gtts import gTTS
from pathlib import Path

OUT_DIR = Path("assets/audio/hiragana/m")
OUT_DIR.mkdir(parents=True, exist_ok=True)

KANA = [
    ("ma", "ま"),
    ("mi", "み"),
    ("mu", "む"),
    ("me", "め"),
    ("mo", "も"),
]

for romaji, kana in KANA:
    tts = gTTS(text=kana, lang="ja", slow=False)
    filepath = OUT_DIR / f"{romaji}.mp3"
    tts.save(str(filepath))
    print("", filepath)

print("\\nListo. Revisa la carpeta:", OUT_DIR.resolve())
