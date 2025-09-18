# scripts/make_wn_audio.py
# -*- coding: utf-8 -*-
from pathlib import Path
from gtts import gTTS
import time, sys

OUT_DIR = Path(__file__).resolve().parents[1] / "assets" / "audio" / "n5" / "wn"
OUT_DIR.mkdir(parents=True, exist_ok=True)

WORDS = [
    ("watashi_wa", "わたしは"),
    ("ringo_wo_tabemasu", "りんごをたべます"),
    ("konbanwa", "こんばんは"),
    ("ongaku_ga_suki", "おんがくがすきです"),
    ("tenki_ga_ii", "てんきがいいです"),
    ("enpitsu_kaimasu", "えんぴつをかいます"),
]

def synth_one(name: str, jp: str, slow: bool = False, tries: int = 3) -> bool:
    target = OUT_DIR / f"{name}.mp3"
    for i in range(1, tries + 1):
        try:
            tts = gTTS(text=jp, lang="ja", slow=slow)
            tts.save(str(target))
            print(f"  {target.name} -> {target}")
            return True
        except Exception as e:
            print(f"   [{name}] intento {i}/{tries} falló: {e}")
            time.sleep(1.0)
    print(f"  No se pudo generar {name}.mp3")
    return False

def main():
    slow = "--slow" in sys.argv
    print(f"Generando MP3 en: {OUT_DIR} (slow={slow})")
    ok = 0
    for fname, jp in WORDS:
        if synth_one(fname, jp, slow=slow):
            ok += 1
    print(f"\nListo: {ok}/{len(WORDS)} archivos.")

if __name__ == "__main__":
    main()
