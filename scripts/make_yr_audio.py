# -*- coding: utf-8 -*-
from pathlib import Path
from gtts import gTTS
import time

# Carpeta de salida: assets/audio/n5/yr
OUT_DIR = Path(__file__).resolve().parents[1] / "assets" / "audio" / "n5" / "yr"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# (archivo, texto_japonés)
WORDS = [
    ("yama", "やま"),
    ("yuki", "ゆき"),
    ("yoru", "よる"),
    ("ringo", "りんご"),
    ("reizouko", "れいぞうこ"),
    ("raion", "らいおん"),
]

def synth_one(name, jp, slow=False, tries=2):
    """Genera name.mp3 con voz japonesa. Reintenta si falla la red."""
    for i in range(tries):
        try:
            tts = gTTS(text=jp, lang="ja", slow=slow)
            tts.save(str(OUT_DIR / f"{name}.mp3"))
            print(f" {name}.mp3")
            return True
        except Exception as e:
            print(f"[{name}] intento {i+1} falló: {e}")
            time.sleep(1.0)
    return False

def main():
    print(f"Generando en: {OUT_DIR}")
    ok = 0
    for name, jp in WORDS:
        if synth_one(name, jp, slow=False):
            ok += 1
    print(f"Listo: {ok}/{len(WORDS)} archivos")

if __name__ == "__main__":
    main()
