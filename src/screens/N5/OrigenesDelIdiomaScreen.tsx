// src/screens/N5/OrigenesSerie.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFeedbackSounds } from '../../hooks/useFeedbackSounds';

// ====== Paddings globales ======
const CONTENT_PAD = 20;
const CARD_PAD    = 16;
const CARD_RADIUS = 16;

// ====== Dimensiones fijas solicitadas ======
const FIXED_CARD_TARGET_W = 350; // ancho objetivo de las tarjetas con imagen
const FIXED_IMG_TARGET_H  = 250; // alto objetivo de las imágenes

// ====== Imágenes (quitamos IMG_HERO porque ahora es video) ======
const IMG_KANJI    = require('../../../assets/images/origenes_kanji.webp');
const IMG_HIRAGANA = require('../../../assets/images/origenes_hiragana.webp');
const IMG_KATAKANA = require('../../../assets/images/origenes_katakana.webp');
const IMG_MAP      = require('../../../assets/images/origenes_mapa.webp');

// ====== YouTube ======
const YT_URL = 'https://youtu.be/2bRN6Zr_XeU';
const YT_EMBED = `https://www.youtube.com/embed/2bRN6Zr_XeU?autoplay=1&mute=0&controls=0&playsinline=1&rel=0&modestbranding=1`;

/* =========================
   GLOSARIO (tooltips)
========================= */
const GLOSSARY: Record<string, string> = {
  Japón: 'País insular del este de Asia compuesto por cuatro islas principales y muchas menores.',
  Jōmon: 'Periodo prehistórico de las islas japonesas (≈ 14,000–300 a.C.).',
  'familia japónica': 'Grupo de lenguas al que pertenecen el japonés y las lenguas de Ryukyu.',
  japonés: 'Lengua principal hablada en Japón; variedad estándar: hyōjungo.',
  Ryukyu: 'Archipiélago al sur de Japón; lenguas ryukyuenses son parientes del japonés.',
  Yayoi: 'Periodo (≈ 300 a.C.–300 d.C.) con agricultura de arroz y fuerte contacto desde Corea.',
  'península coreana': 'Puente cultural e histórico entre China y Japón; gran intercambio humano.',
  Kofun: 'Periodo (≈ 300–538 d.C.) famoso por grandes túmulos funerarios; mayor centralización.',
  escribir: 'Representar el lenguaje mediante signos gráficos (sistemas de escritura).',
  kanji: 'Caracter logográfico de origen chino usado en japonés; puede tener lecturas on/kun.',
  partículas: 'Mini-palabras (は, が, を, に, で, の, へ, も, と) que marcan funciones gramaticales.',
  manyōgana: 'Uso temprano de kanji por su SONIDO para escribir japonés; puente a los silabarios.',
  'Man’yōshū': 'Antología poética del s. VIII que muestra el uso de manyōgana.',
  hiragana: 'Silabario cursivo; se usa para gramática, partículas y palabras nativas.',
  katakana: 'Silabario angular; se usa para préstamos, onomatopeyas y énfasis.',
  gramática: 'Estructura de una lengua: morfología, orden y relaciones (p. ej., partículas).',
  préstamos: 'Palabras tomadas de otros idiomas (gairaigo), p. ej., テレビ, コーヒー.',
  'núcleo semántico': 'La parte central de significado de una palabra o compuesto.',
  学生: '“Estudiante” (gakusei). Kanji 学 (aprender) + 生 (persona/vida).',
  rangaku: '“Estudios holandeses”: vía de entrada de ciencia occidental durante Edo.',
  Meiji: 'Periodo (1868–1912) de modernización acelerada en Japón.',
  'genbun-itchi': 'Movimiento que unificó lengua hablada y escrita para que “sonaran igual”.',
  kango: 'Vocabulario de raíz china leído a la japonesa (p. ej., 経済 “economía”).',
  hyōjungo: '“Lengua estándar” japonesa, basada en Tokio.',
  'jōyō kanji': 'Lista oficial de kanji de uso común (educación y prensa).',
  furigana: 'Pequeños kana sobre/junto al kanji que indican su lectura.',
  'wasei-eigo': '“Inglés hecho en Japón”: palabras que parecen inglesas pero son japonesas (サラリーマン).',
  kokuji: 'Kanji creados en Japón (p. ej., 働 “trabajar”).',
  rendaku: '“Voceo” en compuestos: k→g, t→d… (手+紙 → てがみ).',
  tegami: 'てがみ = “carta”; ejemplo clásico de rendaku (te+kami → teGami).',
  'melodía (pitch accent)': 'Contorno tonal que distingue palabras en japonés; no es acento de intensidad.',
  moras: 'Unidad rítmica breve; no siempre coincide con la sílaba.',
  'vocales largas': 'Vocal prolongada (おう/うう → ō). En katakana se marca con ー.',
  kōhī: 'コーヒー: transcripción de “coffee”; muestra vocal larga en katakana.',
  radicales: 'Partes recurrentes que forman kanji y dan pistas de significado/lectura.',
  'S-O-V': 'Orden oracional típico del japonés: Sujeto–Objeto–Verbo.',
  'です/ます': 'Sufijos/verbo-cópula de la forma cortés en japonés.',
};

/* ===== Tooltip (globo rojo) ===== */
function useTooltip() {
  const [tip, setTip] = useState<{visible:boolean; title:string; text:string; x:number; y:number}>({
    visible: false, title: '', text: '', x: 0, y: 0,
  });
  const show = (title: string, text: string, x: number, y: number) =>
    setTip({ visible: true, title, text, x, y });
  const hide = () => setTip(t => ({ ...t, visible: false }));
  return { tip, show, hide };
}

/* ===== Imagen automática con tamaño forzado ===== */
function AutoImage({
  source,
  bleed = false,
  forcedWidth,
  forcedHeight,
  borderRadius = CARD_RADIUS,
}: {
  source: any;
  bleed?: boolean;
  forcedWidth?: number;
  forcedHeight?: number;
  borderRadius?: number;
}) {
  const meta = Image.resolveAssetSource(source) || { width: 1, height: 1 };
  const aspect = meta.width / meta.height;

  const styleBase: any = {
    width: forcedWidth ? (bleed ? forcedWidth : Math.max(0, forcedWidth - CARD_PAD * 2)) : '100%',
    resizeMode: 'contain',
  };
  if (forcedHeight) {
    styleBase.height = forcedHeight;
  } else {
    styleBase.aspectRatio = aspect;
  }

  if (bleed) {
    return (
      <View style={{ marginHorizontal: -CARD_PAD, borderRadius, overflow: 'hidden', backgroundColor: '#fff' }}>
        <Image source={source} style={styleBase} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={{ ...styleBase, alignSelf: 'center', borderRadius, backgroundColor: '#fff' }}
    />
  );
}

export default function OrigenesSerie() {
  const { tip, show, hide } = useTooltip();
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.min(FIXED_CARD_TARGET_W, screenW - CONTENT_PAD * 1);

  // Mostrar/ocultar el reproductor según foco (evita que siga sonando al salir)
  const [showPlayer, setShowPlayer] = useState(true);
  useFocusEffect(
    React.useCallback(() => {
      setShowPlayer(true);
      return () => setShowPlayer(false);
    }, [])
  );

  const Term = ({ k, children }: { k: keyof typeof GLOSSARY; children: React.ReactNode }) => (
    <Text
      onPress={(e) => {
        const { pageX, pageY } = e.nativeEvent;
        const def = GLOSSARY[k] ?? 'Definición no disponible.';
        show(String(children), def, pageX, pageY);
      }}
      style={s.term}
      suppressHighlighting={false}
    >
      <Text style={s.bold}>{children}</Text>
    </Text>
  );

  const quiz = useMemo(
    () =>
      [
        {
          q: '¿Cuál fue el gran cambio de la era Yayoi que impactó la formación del japonés?',
          options: [
            'Aislamiento total de la península coreana',
            'Agricultura de arroz + contacto intenso con Corea',
            'Nacimiento de hiragana y katakana',
          ],
          a: 1,
          why: 'El arroz y el intercambio con Corea impulsaron transformaciones tecnológicas y culturales clave.',
        },
        {
          q: '¿Qué describe mejor a manyōgana?',
          options: [
            'Un silabario simplificado como hiragana',
            'Una lista moderna de kanji de uso común',
            'Escribir japonés usando kanji por su sonido',
          ],
          a: 2,
          why: 'Manyōgana emplea kanji por su valor fonético; fue el puente hacia los silabarios.',
        },
        {
          q: '¿Cuál es el reparto actual correcto entre los sistemas de escritura?',
          options: [
            'Hiragana = préstamos; Katakana = gramática; Kanji = decorativos',
            'Hiragana = gramática/nativas; Katakana = préstamos/onomatopeyas; Kanji = núcleo de significado',
            'Hiragana = solo nombres propios; Katakana = solo marcas; Kanji = números',
          ],
          a: 1,
          why: 'Así funciona la “banda de tres”: estructura (hiragana), brillo global (katakana) y significado condensado (kanji).',
        },
        {
          q: '¿Cómo se llama el movimiento de Meiji que acercó la lengua escrita a la hablada?',
          options: ['Rendaku', 'Genbun-itchi', 'Hyōjungo'],
          a: 1,
          why: 'Genbun-itchi buscó que los textos sonaran a conversación real. Hyōjungo es el estándar; rendaku es un fenómeno fonético.',
        },
        {
          q: '¿Qué hace el rendaku en palabras compuestas?',
          options: [
            'Elimina vocales largas',
            'Cambia katakana por hiragana',
            'Vuelve sonora la consonante inicial del segundo elemento (k→g, t→d, etc.)',
          ],
          a: 2,
          why: 'Por eso 手 + 紙 pasa de te + kami a てがみ (tegami).',
        },
        {
          q: '¿Para qué sirve el furigana en un texto japonés?',
          options: [
            'Marcar el tema de la oración',
            'Indicar la lectura (pronunciación) de un kanji',
            'Convertir préstamos a katakana',
          ],
          a: 1,
          why: 'El furigana son pequeños signos (normalmente hiragana) que muestran cómo se lee un kanji.',
        },
      ] as { q: string; options: string[]; a: number; why: string }[],
    []
  );

  return (
    <View style={s.root}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="always">
        {/* Tip interactivo */}
        <View style={s.notice}>
          <Text style={s.noticeTitle}>💡 Tip interactivo</Text>
          <Text style={s.noticeText}>
            Puedes tocar las <Text style={s.boldWhite}>palabras en negro</Text> dentro del texto para ver su
            definición en un globo rojo.
          </Text>
        </View>

        {/* HERO + intro */}
        <View style={s.card}>
          {/* === YouTube en el espacio del HERO (misma altura/ancho que la imagen) === */}
          {showPlayer ? (
            <WebView
              source={{ uri: YT_EMBED }}
              style={s.heroImg}
              javaScriptEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false} // Android: permitir autoplay con sonido
              automaticallyAdjustContentInsets={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={[s.heroImg, { backgroundColor: '#000' }]} />
          )}

          <Text style={s.h1}>Orígenes del idioma japonés</Text>

          <Text style={s.pJ}>
            Imagina abrir <Term k="Japón">Japón</Term> como si fuera el primer capítulo de una saga 🌏. Antes de los
            ideogramas, antes de los animes y las apps, ya había voces en esas islas. En la era
            <Term k="Jōmon"> Jōmon</Term>, muy atrás en el calendario, diferentes comunidades hablaban lenguas que no
            eran chinas ni coreanas: eran suyas, de un árbol que los lingüistas llaman
            <Term k="familia japónica"> familia japónica</Term>, donde hoy viven el <Term k="japonés">japonés</Term> y
            las lenguas de <Term k="Ryukyu">Ryukyu</Term> (Okinawa y alrededores).
          </Text>

          <Text style={s.pJ}>
            Luego llega <Term k="Yayoi">Yayoi</Term> y con él el arroz, el metal y —sobre todo— el trato constante con
            la <Term k="península coreana">península coreana</Term> 🤝. No fue copiar y pegar un idioma; fue una chispa:
            nuevas técnicas, gente que va y viene, palabras que se rozan, ideas que se mezclan.
          </Text>

          <Text style={s.pJ}>
            Con <Term k="Kofun">Kofun</Term> cambia el escenario. Aparecen enormes tumbas con forma de cerradura, la
            política se ordena, y surge una necesidad muy humana: <Term k="escribir">escribir</Term>. Entra el “plot
            twist” 📜: llegan los <Term k="kanji">kanji</Term>. El japonés usa <Term k="partículas">partículas</Term> y
            flexiona verbos; la respuesta creativa fue el <Term k="manyōgana">manyōgana</Term>, visible en el
            <Term k="Man’yōshū"> Man’yōshū</Term>.
          </Text>

          <Text style={s.pJ}>
            De ese puente nacen <Term k="hiragana">hiragana</Term> y <Term k="katakana">katakana</Term> ✍️. Con el
            tiempo: hiragana para la <Term k="gramática">gramática</Term> y palabras nativas; katakana para
            <Term k="préstamos"> préstamos</Term> y onomatopeyas; kanji para el
            <Term k="núcleo semántico"> núcleo semántico</Term>. Cuando lees わたしは<Term k="学生">学生</Term>です, la banda
            suena completa 🎶.
          </Text>

          <Text style={s.pJ}>
            La saga sigue. Llegan europeos y, en Edo, el <Term k="rangaku">rangaku</Term> 🔬. En
            <Term k="Meiji"> Meiji</Term> aparece <Term k="genbun-itchi">genbun-itchi</Term>; florecen neologismos de
            raíz <Term k="kango">kango</Term> y se consolida <Term k="hyōjungo">hyōjungo</Term>.
          </Text>

          <Text style={s.pJ}>
            El siglo XX fija <Term k="jōyō kanji">jōyō kanji</Term> y normaliza <Term k="furigana">furigana</Term> 🧠.
            Surgen <Term k="wasei-eigo">wasei-eigo</Term> y <Term k="kokuji">kokuji</Term>. Juega el
            <Term k="rendaku"> rendaku</Term>, que convierte 手+紙 en <Term k="tegami">tegami</Term>.
          </Text>

          <Text style={s.pJ}>
            En resumen: primero voz; luego <Term k="kanji">kanji</Term>; por fin
            <Term k="hiragana"> hiragana</Term> y <Term k="katakana">katakana</Term>. Desde entonces,
            <Term k="kanji"> kanji</Term> + <Term k="hiragana">hiragana</Term> + <Term k="katakana">katakana</Term> =
            un idioma que mezcla sin perder identidad ✨.
          </Text>
        </View>

        {/* Lo básico */}
        <View style={s.card}>
          <Text style={s.h2}>Temporada 0: cómo suena y cómo se arma 🎧</Text>

          <Text style={s.pJ}>
            El japonés va de <Term k="melodía (pitch accent)">melodía (pitch accent)</Term>. Su ritmo usa
            <Term k="moras"> moras</Term>: ta–be–ma–su tiene cuatro; la っ cuenta como una. Hay
            <Term k="vocales largas"> vocales largas</Term> —コーヒー = <Term k="kōhī">kōhī</Term>.
          </Text>

          <Text style={s.pJ}>
            Empiezas con <Term k="hiragana">hiragana</Term> y <Term k="furigana">furigana</Term>, sigues con
            <Term k="katakana"> katakana</Term> (コンビニ, アプリ, ゲーム) y pasas a <Term k="kanji">kanji</Term> apoyándote en
            <Term k="radicales"> radicales</Term>.
          </Text>

          <Text style={s.pJ}>
            En gramática, piensa en LEGO: orden <Term k="S-O-V">S-O-V</Term>, verbo al final y
            <Term k="partículas"> partículas</Term> marcando funciones. Con <Term k="です/ます">です/ます</Term> suenas cortés; el
            informal llega después.
          </Text>
        </View>

        {/* Sistemas de escritura – tarjetas */}
        <View style={s.grid3}>
          <View style={[s.card, { width: cardW, alignSelf: 'center' }]}>
            <Text style={s.h3}>漢字 Kanji</Text>
            <Text style={s.pJ}>Ideogramas con <Text style={s.bold}>significado</Text>.</Text>
            <AutoImage source={IMG_KANJI} bleed forcedWidth={cardW} forcedHeight={FIXED_IMG_TARGET_H} />
          </View>

          <View style={[s.card, { width: cardW, alignSelf: 'center' }]}>
            <Text style={s.h3}>ひらがな Hiragana</Text>
            <Text style={s.pJ}>Silabario de la <Text style={s.bold}>gramática</Text> y palabras nativas.</Text>
            <AutoImage source={IMG_HIRAGANA} forcedWidth={cardW} forcedHeight={FIXED_IMG_TARGET_H} />
          </View>

          <View style={[s.card, { width: cardW, alignSelf: 'center' }]}>
            <Text style={s.h3}>カタカナ Katakana</Text>
            <Text style={s.pJ}>Silabario de <Text style={s.bold}>préstamos</Text> y onomatopeyas.</Text>
            <AutoImage source={IMG_KATAKANA} forcedWidth={cardW} forcedHeight={FIXED_IMG_TARGET_H} />
          </View>
        </View>

        {/* Mapa */}
        <View style={[s.card, { width: cardW, alignSelf: 'center' }]}>
          <Text style={s.h2}>Mapa de rutas culturales 🗺️</Text>
          <Text style={s.pJ}>
            China → Corea → Japón: la escritura, la religión y la tecnología viajan y dejan huella.
          </Text>
          <AutoImage
            source={IMG_MAP}
            forcedWidth={cardW}
            forcedHeight={FIXED_IMG_TARGET_H}
            bleed
          />
        </View>

        {/* Quiz */}
        <QuizBlock questions={quiz} />
      </ScrollView>

      {/* Tooltip rojo */}
      {tip.visible && (
        <Pressable style={s.overlay} onPress={hide}>
          <View style={[s.tooltip, { top: Math.max(tip.y - 120, 80), left: 16, right: 16 }]}>
            <Text style={s.tooltipTitle}>{tip.title}</Text>
            <Text style={s.tooltipText}>{tip.text}</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

/* ===== Quiz con sonidos ===== */
function QuizBlock({
  questions,
}: {
  questions: { q: string; options: string[]; a: number; why: string }[];
}) {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const correct = answers.reduce((acc, cur, i) => (cur === questions[i].a ? acc + 1 : acc), 0);

  const handlePress = (qIndex: number, optIndex: number, isRight: boolean) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
    try {
      if (isRight) playCorrect();
      else playWrong();
    } catch {}
  };

  return (
    <View style={s.card}>
      <Text style={s.h2}>Mini-quiz (6)</Text>
      <Text style={[s.caption, { marginBottom: 8 }]}>
        Toca una opción y revisa la explicación. Puntuación: {correct}/{questions.length}
      </Text>

      {questions.map((it, idx) => {
        const selected = answers[idx];
        const isAnswered = selected !== -1;
        const isCorrect = isAnswered && selected === it.a;

        return (
          <View key={idx} style={{ marginBottom: 16 }}>
            <Text style={s.h3}>{idx + 1}. {it.q}</Text>
            <View style={{ gap: 8, marginTop: 6 }}>
              {it.options.map((opt, i) => {
                const chosen = selected === i;
                const ok = i === it.a;
                return (
                  <Pressable
                    key={i}
                    onPressIn={() => handlePress(idx, i, ok)}
                    android_ripple={{ color: '#e5e7eb' }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={[s.opt, chosen && (ok ? s.optOk : s.optNo)]}
                  >
                    <Text style={[s.optTxt, chosen && { color: '#111827' }]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>

            {isAnswered && (
              <Text style={[s.pJ, { marginTop: 6 }]}>
                {isCorrect ? '✅ ¡Correcto!' : '❌ No exactamente.'} {it.why}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* ==================
   ESTILOS
================== */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  content: { padding: CONTENT_PAD, paddingBottom: 40, gap: 12 },

  notice: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderLeftWidth: 4,
    borderLeftColor: '#111827',
  },
  noticeTitle: { color: '#ffffff', fontWeight: '800', marginBottom: 4, fontSize: 14 },
  noticeText:  { color: '#ffffff', fontSize: 13, lineHeight: 20 },
  boldWhite:   { color: '#ffffff', fontWeight: '800' },

  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: CARD_PAD,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  h1: { color: '#111827', fontSize: 22, fontWeight: '800', marginTop: 12, marginBottom: 6 },
  h2: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  h3: { color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 6 },

  pJ: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  caption: { color: '#6b7280', fontSize: 12 },

  grid3: { gap: 15 },

  // Mantiene el espacio exacto del antiguo IMG_HERO
  heroImg: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },

  bold: { fontWeight: '800', color: '#111827' },
  term: { paddingHorizontal: 2 },

  // Quiz
  opt: {
    borderWidth: 1,
    borderColor: '#cfd6df',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  optOk: { backgroundColor: '#c8f7c5', borderColor: '#8ee08a' },
  optNo: { backgroundColor: '#fde2e2', borderColor: '#f5b5b5' },
  optTxt: { color: '#111827', fontSize: 14 },

  // Tooltip (rojo)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.25)',
    justifyContent: 'flex-start',
    zIndex: 1000,
  },
  tooltip: {
    position: 'absolute',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#b91c1c',
  },
  tooltipTitle: { color: '#fff', fontWeight: '800', marginBottom: 4, fontSize: 14 },
  tooltipText: { color: '#fff', fontSize: 13, lineHeight: 19 },
});
