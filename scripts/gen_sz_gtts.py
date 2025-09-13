from gtts import gTTS
from pathlib import Path

pairs_s = [("sa","さ。さかな。"),("shi","し。しま。"),("su","す。すし。"),("se","せ。せんせい。"),("so","そ。そら。")]
pairs_z = [("za","ざ。ざる。"),("ji","じ。じしょ。"),("zu","ず。ずぼん。"),("ze","ぜ。ぜんぶ。"),("zo","ぞ。ぞう。")]

base = Path("assets/audio/n5")
(base/"grupoS").mkdir(parents=True, exist_ok=True)
(base/"grupoZ").mkdir(parents=True, exist_ok=True)

def save_all(pairs, folder):
    for name, text in pairs:
        out = base/folder/f"{name}.mp3"
        print("", out)
        gTTS(text=text, lang="ja").save(str(out))

save_all(pairs_s, "grupoS")
save_all(pairs_z, "grupoZ")
print("Listo ")
