# -*- coding: utf-8 -*-
from pathlib import Path
from gtts import gTTS
import time

def synth(pairs, out_dir):
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    ok = 0
    for name, text in pairs:
        dst = out / f"{name}.mp3"
        for i in range(3):
            try:
                gTTS(text=text, lang="ja").save(str(dst))
                print(f" {dst}")
                ok += 1
                break
            except Exception as e:
                print(f"[{name}] retry {i+1}: {e}")
                time.sleep(1.0)
    print(f"Listo {ok}/{len(pairs)} -> {out}")

YR = [
    ("yama","やま"),
    ("yuki","ゆき"),
    ("yoru","よる"),
    ("ringo","りんご"),
    ("reizouko","れいぞうこ"),
    ("raion","らいおん"),
]
WN = [
    ("hon","ほん"),
    ("ongaku","おんがく"),
    ("ginkou","ぎんこう"),
    ("san","さん"),
    ("ten","てん"),
    ("ame","あめ"),
    ("sakana","さかな"),
    ("hayai","はやい"),
    ("neko","ねこ"),
    ("mizu","みず"),
]

root = Path(__file__).resolve().parents[1]
synth(YR, root / "assets" / "audio" / "n5" / "yr")
synth(WN, root / "assets" / "audio" / "n5" / "wn")
