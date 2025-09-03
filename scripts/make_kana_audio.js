// scripts/make_kana_audio.js
const fs = require("fs");
const path = require("path");
const gTTS = require("gtts");
const pLimit = require("p-limit").default; // <- FIX: ESM default export

// === Salidas ===
const OUT_PHRASES = path.join(__dirname, "..", "assets", "audio", "n5", "grupoA");
const OUT_EXAMPLES = path.join(OUT_PHRASES, "examples");
fs.mkdirSync(OUT_PHRASES, { recursive: true });
fs.mkdirSync(OUT_EXAMPLES, { recursive: true });

// === Dataset ===
// Frases para la pantalla de Pronunciación (kana + ejemplo): “あ、あめ”
const PHRASES = [
  { filename: "a_phrase.mp3", text: "あ、あめ" },
  { filename: "i_phrase.mp3", text: "い、いぬ" },
  { filename: "u_phrase.mp3", text: "う、うみ" },
  { filename: "e_phrase.mp3", text: "え、えき" },
  { filename: "o_phrase.mp3", text: "お、おちゃ" },
];

// Palabras para EjemplosGrupoA (solo la palabra)
const EXAMPLES = [
  { filename: "a_ame.mp3", text: "あめ" },
  { filename: "a_asa.mp3", text: "あさ" },
  { filename: "a_ai.mp3", text: "あい" },
  { filename: "i_inu.mp3", text: "いぬ" },
  { filename: "i_ie.mp3", text: "いえ" },
  { filename: "i_isu.mp3", text: "いす" },
  { filename: "u_umi.mp3", text: "うみ" },
  { filename: "u_ushi.mp3", text: "うし" },
  { filename: "u_uta.mp3", text: "うた" },
  { filename: "e_eki.mp3", text: "えき" },
  { filename: "e_enpitsu.mp3", text: "えんぴつ" },
  { filename: "e_e.mp3", text: "え" },
  { filename: "o_ocha.mp3", text: "おちゃ" },
  { filename: "o_onigiri.mp3", text: "おにぎり" },
  { filename: "o_okane.mp3", text: "おかね" },
];

const limit = pLimit(3); // no satures el TTS

function saveTTS(text, outPath) {
  return new Promise((resolve, reject) => {
    const tts = new gTTS(text, "ja"); // japonés
    const ws = fs.createWriteStream(outPath);
    tts.stream().pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
  });
}

(async () => {
  try {
    console.log(">> Generando frases (Pronunciación)...");
    await Promise.all(
      PHRASES.map(({ filename, text }) =>
        limit(() => saveTTS(text, path.join(OUT_PHRASES, filename)))
      )
    );

    console.log(">> Generando ejemplos (EjemplosGrupoA)...");
    await Promise.all(
      EXAMPLES.map(({ filename, text }) =>
        limit(() => saveTTS(text, path.join(OUT_EXAMPLES, filename)))
      )
    );

    console.log("✅ Listo. Audios en:");
    console.log("   ", OUT_PHRASES);
    console.log("   ", OUT_EXAMPLES);
  } catch (e) {
    console.error("❌ Error generando audios:", e);
    process.exit(1);
  }
})();
