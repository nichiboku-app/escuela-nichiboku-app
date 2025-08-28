// src/screens/N5/CulturaScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useFeedbackSounds } from '../../hooks/useFeedbackSounds';

/** Si ya tienes una imagen hero para cultura, ponla aquí y cambia HAS_IMAGE a true */
// const IMG_CULTURA = require('../../../assets/images/cultura_hero.webp');
const HAS_IMAGE = false;

/* ============ GLOSARIO (términos tocables) ============ */
const GLOSSARY: Record<string, string> = {
  おじぎ: 'Ojigi = el saludo con inclinación. Ángulo leve (15°) casual, 30° formal, 45° muy respetuoso.',
  玄関: 'Genkan = entrada de la casa. Ahí te quitas los zapatos y te pones pantuflas.',
  いただきます: '“Itadakimasu” se dice antes de comer: “con gratitud, recibo”.',
  ごちそうさまでした: 'Expresión al terminar de comer: “gracias por la comida”.',
  すみません: 'Sumimasen = “disculpa”/“perdón”/“gracias (por la molestia)”. Muy útil.',
  // ⚠️ clave ASCII para evitar \u30fb
  senpai_kohai: 'Senpai/kōhai = relación mayor-menor experiencia (escuela, trabajo).',
  敬語: 'Keigo = lenguaje honorífico/formal. Se usa para mostrar respeto (clientes, jefes, mayores).',
  お土産: 'Omiyage = regalo/recuerdo del viaje para compañeros/familia. Suele ser comestible, empaques individuales.',
  温泉: 'Onsen = baños termales. Dúchate antes; muchas instalaciones restringen tatuajes (consulta o cubre).',
  満員電車: 'Tren lleno (“man’in densha”): silencio, mochila al frente, teléfono en modo “manner”.',
  コンビニ: 'Konbini = tienda de conveniencia 24/7 (pagos, impresiones, comida, envíos).',
};

/* ============ TOOLTIP ROJO ============ */
function useTooltip() {
  const [tip, setTip] = useState<{visible:boolean; title:string; text:string; x:number; y:number}>({
    visible:false, title:'', text:'', x:0, y:0,
  });
  const show = (title:string, text:string, x:number, y:number) =>
    setTip({ visible:true, title, text, x, y });
  const hide = () => setTip(t => ({ ...t, visible:false }));
  return { tip, show, hide };
}

/* ============ FRASES RÁPIDAS (para tooltip con romaji) ============ */
const PHRASES: {jp:string; ro:string; es:string}[] = [
  { jp:'おはようございます', ro:'ohayō gozaimasu', es:'buenos días (formal)' },
  { jp:'こんにちは', ro:'konnichiwa', es:'hola / buenas tardes' },
  { jp:'こんばんは', ro:'konbanwa', es:'buenas noches (al llegar)' },
  { jp:'ありがとうございます', ro:'arigatō gozaimasu', es:'muchas gracias (formal)' },
  { jp:'すみません', ro:'sumimasen', es:'disculpa / perdón' },
  { jp:'お願いします', ro:'onegaishimasu', es:'por favor (solicitud cortés)' },
  { jp:'いただきます', ro:'itadakimasu', es:'antes de comer' },
  { jp:'ごちそうさまでした', ro:'gochisōsama deshita', es:'después de comer' },
];

/* ============ PANTALLA ============ */
export default function CulturaScreen() {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const { tip, show, hide } = useTooltip();

  const Term = ({ k, children }: { k: keyof typeof GLOSSARY; children: React.ReactNode }) => (
    <Text
      onPressIn={(e) => {
        const { pageX, pageY } = e.nativeEvent;
        show(String(children), GLOSSARY[k], pageX, pageY);
      }}
      style={s.term}
    >
      <Text style={s.bold}>{children}</Text>
    </Text>
  );

  const quiz = useMemo(
    () => [
      {
        q: 'En el tren (満員電車), ¿qué conducta es correcta?',
        opts: ['Llamadas cortas y hablar alto', 'Teléfono en modo “manner” y silencio', 'Mochila en la espalda'],
        a: 1,
        why: 'Se prioriza silencio, notificaciones apagadas y mochila al frente.',
      },
      {
        q: 'Al entrar a una casa japonesa (玄関 genkan), lo correcto es…',
        opts: ['Mantener zapatos por educación', 'Quitarte los zapatos y usar pantuflas', 'Entrar descalzo siempre, sin más'],
        a: 1,
        why: 'Los zapatos se dejan en el genkan y se usan pantuflas dentro.',
      },
      {
        q: 'Antes de comer, la frase tradicional es…',
        opts: ['ごちそうさまでした', 'いただきます', 'すみません'],
        a: 1,
        why: '“いただきます” expresa gratitud antes de comer.',
      },
      {
        q: 'En un 温泉 (onsen), ¿qué regla es clave?',
        opts: ['Entrar con bañador', 'Ducharse antes y preguntar por tatuajes', 'Hacer fotos para el recuerdo'],
        a: 1,
        why: 'Hay que lavarse antes; muchas instalaciones limitan tatuajes: pregunta o cubre.',
      },
      {
        q: 'Un buen お土産 (omiyage) para la oficina suele ser…',
        opts: ['Dulces empaquetados individualmente', 'Un regalo caro para el jefe', 'Algo que huela fuerte'],
        a: 0,
        why: 'Se busca compartir; empaques individuales son prácticos y considerados.',
      },
      {
        q: 'Sobre 敬語 (keigo), ¿qué afirmación es correcta?',
        opts: ['Solo lo usan estudiantes', 'Es lenguaje honorífico para mostrar respeto', 'Se usa para bromear con amigos'],
        a: 1,
        why: 'Keigo se usa con clientes, mayores, jefes; marca cortesía y distancia social.',
      },
    ],
    []
  );

  const [answers, setAnswers] = useState<number[]>(Array(6).fill(-1));
  const score = answers.reduce((acc, cur, i) => (cur === quiz[i].a ? acc + 1 : acc), 0);

  const press = (idx: number, choice: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[idx] = choice;
      return next;
    });

    try {
      if (choice === quiz[idx].a) {
        void playCorrect();
      } else {
        void playWrong();
      }
    } catch {}
  };

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {/* AVISO INTERACTIVO */}
        <View style={s.notice}>
          <Text style={s.noticeTitle}>💡 Tip interactivo</Text>
          <Text style={s.noticeText}>
            Toca las <Text style={s.boldWhite}>palabras en negro</Text> o cualquier <Text style={s.boldWhite}>frase</Text> para ver un globo rojo con definiciones o pronunciación.
          </Text>
        </View>

        {/* HERO */}
        <View style={s.card}>
          {HAS_IMAGE ? (
            // <Image source={IMG_CULTURA} style={s.hero} />
            <View />
          ) : (
            <View style={[s.hero, { backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#111827', fontWeight: '800' }}>CULTURA BÁSICA (hero)</Text>
            </View>
          )}
          <Text style={s.h1}>Cultura básica: la guía “vivir y convivir” 🇯🇵</Text>
          <Text style={s.pJ}>
            Japón valora el <Text style={s.bold}>respeto silencioso</Text>, el <Text style={s.bold}>orden</Text> y la <Text style={s.bold}>consideración por los demás</Text>.
            Aquí tienes lo esencial para moverte con confianza: desde el <Term k="おじぎ">おじぎ</Term> (inclinación) hasta el mundo de los <Term k="コンビニ">コンビニ</Term>.
          </Text>
        </View>

        {/* SALUDOS Y TRATO */}
        <View style={s.card}>
          <Text style={s.h2}>Saludos y trato</Text>
          <Text style={s.pJ}>
            El saludo va con <Term k="おじぎ">おじぎ</Term> (leve 15° casual, 30° formal, 45° muy respetuoso). El contacto físico es mínimo; un “hola” con
            inclinación y una sonrisa funciona perfecto. Para dirigirte a alguien, añade <Text style={s.bold}>-san</Text> (Tanaka-san). Con profesores o
            jefes, notarás <Term k="敬語">敬語</Term> (honoríficos).
          </Text>
          <Text style={s.pJ}>
            En la escuela o el trabajo existe la relación <Term k="senpai_kohai">先輩/後輩</Term> (senpai/kōhai). Si dudas, sé más formal: luego puedes relajar.
          </Text>
        </View>

        {/* EN CASA */}
        <View style={s.card}>
          <Text style={s.h2}>En casa</Text>
          <Text style={s.pJ}>
            En el <Term k="玄関">玄関</Term> te quitas los zapatos y te pones pantuflas. Hay pantuflas aparte para el baño. Si vas de visita,
            un pequeño <Term k="お土産">お土産</Term> (galletitas) encanta.
          </Text>
        </View>

        {/* TRENES Y CALLES */}
        <View style={s.card}>
          <Text style={s.h2}>Tren, calle y espacios públicos</Text>
          <Text style={s.pJ}>
            En <Term k="満員電車">満員電車</Term> cuida el silencio, lleva la mochila al frente y activa el modo “manner”. En escaleras mecánicas, alinea con el flujo local
            (varía por región). En restaurantes pequeños, un <Term k="すみません">すみません</Term> amable llama al staff.
          </Text>
        </View>

        {/* MESA Y ONSEN */}
        <View style={s.card}>
          <Text style={s.h2}>Mesa y baños termales</Text>
          <Text style={s.pJ}>
            Antes de comer: <Term k="いただきます">いただきます</Term>. Al terminar: <Term k="ごちそうさまでした">ごちそうさまでした</Term>. No claves los palillos verticalmente en el arroz
            ni pases comida de palillo a palillo (gestos funerarios). En <Term k="温泉">温泉</Term>, dúchate antes; consulta reglas si tienes tatuajes.
          </Text>
        </View>

        {/* FRASES RÁPIDAS */}
        <View style={s.card}>
          <Text style={s.h2}>Frases rápidas</Text>
          <View style={s.phraseWrap}>
            {PHRASES.map((p, i) => (
              <Pressable
                key={i}
                onPressIn={(e) => {
                  const { pageX, pageY } = e.nativeEvent;
                  const text = `${p.ro}\n${p.es}`;
                  show(p.jp, text, pageX, pageY);
                }}
                android_ripple={{ color: '#e5e7eb' }}
                style={s.phraseChip}
              >
                <Text style={s.phraseJP}>{p.jp}</Text>
                <Text style={s.phraseES}>{p.es}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* QUIZ */}
        <View style={s.card}>
          <Text style={s.h2}>Mini-quiz cultura (6)</Text>
          <Text style={[s.caption, { marginBottom: 8 }]}>Puntuación: {score}/{quiz.length}</Text>

          {quiz.map((q, idx) => {
            const selected = answers[idx];
            const isAnswered = selected !== -1;
            const isCorrect = isAnswered && selected === q.a;
            return (
              <View key={idx} style={{ marginBottom: 16 }}>
                <Text style={s.h3}>{idx + 1}. {q.q}</Text>
                <View style={{ gap: 8, marginTop: 6 }}>
                  {q.opts.map((opt, i) => {
                    const chosen = selected === i;
                    return (
                      <Pressable
                        key={i}
                        onPressIn={() => press(idx, i)}
                        android_ripple={{ color: '#e5e7eb' }}
                        style={[s.opt, chosen && (i === q.a ? s.optOk : s.optNo)]}
                      >
                        <Text style={[s.optTxt, chosen && { color: '#111827' }]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {isAnswered && (
                  <Text style={[s.p, { marginTop: 6 }]}>
                    {isCorrect ? '✅ ¡Correcto!' : '❌ No exactamente.'} {q.why}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* OVERLAY TOOLTIP ROJO */}
      {tip.visible && (
        <Pressable style={s.overlay} onPress={() => hide()}>
          <View style={[s.tooltip, { top: Math.max(tip.y - 120, 90), left: 16, right: 16 }]}>
            <Text style={s.tooltipTitle}>{tip.title}</Text>
            <Text style={s.tooltipText}>{tip.text}</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

/* ============ ESTILOS (tema claro con tooltip rojo) ============ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  content: { padding: 20, paddingBottom: 40, gap: 12 },

  // Aviso
  notice: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  noticeTitle: { color: '#fff', fontWeight: '800', marginBottom: 4, fontSize: 14 },
  noticeText: { color: '#fff', fontSize: 13, lineHeight: 20 },
  boldWhite: { color: '#fff', fontWeight: '800' },

  // Tarjetas
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Hero
  hero: { width: '100%', height: 190, borderRadius: 14, marginBottom: 12, resizeMode: 'cover' },

  // Tipografía
  h1: { color: '#111827', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  h2: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  h3: { color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  p: { color: '#374151', fontSize: 14, lineHeight: 20 },
  pJ: { color: '#374151', fontSize: 14, lineHeight: 22, textAlign: 'justify', marginBottom: 12 },
  caption: { color: '#6b7280', fontSize: 12 },

  // Frases rápidas
  phraseWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  phraseChip: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  phraseJP: { color: '#111827', fontWeight: '800' },
  phraseES: { color: '#6b7280', fontSize: 12 },

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

  // Término tocable y tooltip
  term: { paddingHorizontal: 2 },
  bold: { fontWeight: '800', color: '#111827' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.25)',
    justifyContent: 'flex-start',
    zIndex: 9999,
    elevation: 50,
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
