# -*- coding: utf-8 -*-
from pathlib import Path
from gtts import gTTS
import time

OUT_DIR = Path(__file__).resolve().parents[1] / "assets" / "audio" / "katakana"
OUT_DIR.mkdir(parents=True, exist_ok=True)

KANA = [
    ("a","ア"),("i","イ"),("u","ウ"),("e","エ"),("o","オ"),
    ("ka","カ"),("ki","キ"),("ku","ク"),("ke","ケ"),("ko","コ"),
    ("sa","サ"),("shi","シ"),("su","ス"),("se","セ"),("so","ソ"),
    ("ta","タ"),("chi","チ"),("tsu","ツ"),("te","テ"),("to","ト"),
    ("na","ナ"),("ni","ニ"),("nu","ヌ"),("ne","ネ"),("no","ノ"),
    ("ha","ハ"),("hi","ヒ"),("fu","フ"),("he","ヘ"),("ho","ホ"),
    ("ma","マ"),("mi","ミ"),("mu","ム"),("me","メ"),("mo","モ"),
    ("ya","ヤ"),("yu","ユ"),("yo","ヨ"),
    ("ra","ラ"),("ri","リ"),("ru","ル"),("re","レ"),("ro","ロ"),
    ("wa","ワ"),("wo","ヲ"),("n","ン"),
]

def synth(name, text, tries=2, slow=False):
    target = OUT_DIR / f"{name}.mp3"
    for i in range(tries):
        try:
            tts = gTTS(text=text, lang="ja", slow=slow)
            tts.save(str(target))
            print(f" {target.name}")
            return True
        except Exception as e:
            print(f"[{name}] intento {i+1} falló: {e}")
            time.sleep(1.0)
    return False

def main():
    print(f"Guardando en: {OUT_DIR}")
    ok = 0
    for name, text in KANA:
        if synth(name, text):
            ok += 1
    print(f"Listo: {ok}/{len(KANA)} archivos")

if __name__ == "__main__":
    main()
