from gtts import gTTS
import os

DEST = os.path.join("assets", "audio", "n5", "grupoN")
os.makedirs(DEST, exist_ok=True)

items = [
    {"key": "na", "text": "な。なつ。"},   # na / natsu
    {"key": "ni", "text": "に。にほん。"}, # ni / nihon
    {"key": "nu", "text": "ぬ。ぬの。"},   # nu / nuno
    {"key": "ne", "text": "ね。ねこ。"},   # ne / neko
    {"key": "no", "text": "の。のむ。"},   # no / nomu
]

for it in items:
    out_path = os.path.join(DEST, f"{it['key']}.mp3")
    print(" Generando", out_path)
    tts = gTTS(text=it["text"], lang="ja")
    tts.save(out_path)

print(" Listo. Archivos en:", DEST)
