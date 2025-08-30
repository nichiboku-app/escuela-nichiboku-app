// src/screens/N5/QuizCultural.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFeedbackSounds } from '../../hooks/useFeedbackSounds';
import {
    AchievementPayload,
    awardAchievement, // idempotente (transacción)
    getAchievement,
} from '../../services/achievements';

type Question = {
  q: string;
  options: string[];
  a: number;
  why: string;
};

const QUESTIONS: Question[] = [
  { q: "¿De qué país llegaron originalmente los caracteres que inspiraron a los kanji?",
    options: ["Corea", "China", "India"], a: 1,
    why: "Los kanji provienen de China; muchas influencias llegaron vía Corea." },
  { q: "¿Cómo se llamaba el uso temprano de kanji por su sonido para escribir japonés?",
    options: ["Manyōgana", "Furigana", "Rendaku"], a: 0,
    why: "Manyōgana empleaba kanji por su valor fonético; fue el puente hacia los silabarios." },
  { q: "¿Qué silabario se usa sobre todo para gramática y palabras nativas?",
    options: ["Katakana", "Hiragana", "Kanji"], a: 1,
    why: "Hiragana cubre partículas y morfología; katakana, préstamos y onomatopeyas." },
  { q: "¿Cuál es el propósito del furigana?",
    options: ["Indicar pronunciación de un kanji", "Marcar tema de la oración", "Formar palabras compuestas"], a: 0,
    why: "Furigana son pequeños kana que muestran la lectura del kanji." },
  { q: "¿Qué fenómeno vuelve sonora la consonante en compuestos (k→g, t→d…)?",
    options: ["Rendaku", "Itadakimasu", "On'yomi"], a: 0,
    why: "Rendaku: 手+紙 → てがみ (te-kami → te-gami)." },
  { q: "¿Qué estructura marca la entrada a un recinto sagrado sintoísta?",
    options: ["Torii", "Pagoda", "Bonshō"], a: 0,
    why: "El torii separa el espacio profano del sagrado." },
  { q: "El sonido solemne de campana grande en templos budistas se llama…",
    options: ["Taiko", "Bonshō", "Shamisen"], a: 1,
    why: "Bonshō es la gran campana budista usada en ceremonias." },
  { q: "Kioto es célebre por…",
    options: ["Calles tradicionales y templos", "Industria automotriz pesada", "Rascacielos de neón por doquier"], a: 0,
    why: "Kioto mantiene barrios tradicionales, templos y santuarios históricos." },
  { q: "Tokio es famosa por…",
    options: ["Avenidas modernas y neón", "Playas tropicales", "Bosques de bambú milenarios"], a: 0,
    why: "Tokio concentra modernidad, rascacielos y tecnología." },
  { q: "El té verde en ceremonia se llama…",
    options: ["Matcha", "Gyokuro", "Oolong"], a: 0,
    why: "El matcha es el protagonista de la ceremonia del té." },
  { q: "El japonés contrasta sobre todo…",
    options: ["Acento de intensidad", "Melodía (pitch accent)", "Tonos como el mandarín"], a: 1,
    why: "El japonés usa patrones melódicos (pitch accent)." },
  { q: "¿Qué unidad rítmica breve se usa para medir el tiempo de la palabra?",
    options: ["Sílaba", "Mora", "Beat"], a: 1,
    why: "La mora; p. ej., ta–be–ma–su tiene 4 moras." },
  { q: "¿Cómo se marcan las vocales largas en katakana?",
    options: ["Con っ", "Con ー (chōon)", "Con ぁ/ぃ/ぅ"], a: 1,
    why: "En katakana se usa la barra larga ー para alargar la vocal." },
  { q: "¿Qué significa 学生 (gakusei)?",
    options: ["Estudiante", "Maestro", "Escuela"], a: 0,
    why: "学 (aprender) + 生 (persona/vida) → 'estudiante'." },
  { q: "Orden oracional típico del japonés:",
    options: ["S-V-O", "S-O-V", "V-S-O"], a: 1,
    why: "Sujeto–Objeto–Verbo; el verbo se coloca al final." },
  { q: "Quitar los zapatos al entrar a casa es…",
    options: ["Frecuente por limpieza y costumbre", "Solo en templos", "Raro"], a: 0,
    why: "Es común por respeto y limpieza del tatami/suelo." },
  { q: "El saludo 'Itadakimasu' se dice antes de…",
    options: ["Comer", "Dormir", "Entrar al templo"], a: 0,
    why: "Se agradece la comida antes de empezar." },
  { q: "¿Qué flor simboliza la fugacidad y la belleza en Japón?",
    options: ["Sakura (cerezo)", "Girasol", "Loto"], a: 0,
    why: "La sakura representa lo efímero y bello." },
  { q: "Una calle tradicional de Kioto por la noche suele tener…",
    options: ["Faroles cálidos y madera", "Neón azul y hologramas", "Rascacielos de vidrio"], a: 0,
    why: "La madera, faroles y estrechez crean su atmósfera clásica." },
  { q: "¿Cuál de estas palabras refleja préstamo ibérico histórico?",
    options: ["Pan", "Kimono", "Sushi"], a: 0,
    why: "‘Pan’ llegó del portugués/español; hay otros como ‘biidoro’ (vidrio)." },
];

// ===== Toast de Logro =====
function AchievementToast({ visible, title, subtitle }: { visible: boolean; title: string; subtitle: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.delay(2200),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
      ]).start();
    }
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.View style={[s.toast, { opacity }]}>
      <Text style={s.toastTitle}>🏅 {title}</Text>
      <Text style={s.toastSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

export default function QuizCultural() {
  const { playCorrect, playWrong } = useFeedbackSounds();

  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [granting, setGranting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [alreadyCompleted, setAlreadyCompleted] = useState<boolean | null>(null); // null = cargando
  const [remoteScore, setRemoteScore] = useState<number | null>(null);

  // Estado remoto (bloqueo si ya lo resolvió)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const ach = await getAchievement('quiz_cultural_01');
          if (cancelled) return;
          if (ach) {
            setAlreadyCompleted(true);
            setRemoteScore(ach.score ?? null);
            setSubmitted(true);
          } else {
            setAlreadyCompleted(false);
            setRemoteScore(null);
            setSubmitted(false);
            setAnswers(Array(QUESTIONS.length).fill(-1));
          }
        } catch (e) {
          console.warn('getAchievement error:', e);
          if (!cancelled) setAlreadyCompleted(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const score = useMemo(
    () => answers.filter((ans, i) => ans === QUESTIONS[i].a).length,
    [answers]
  );
  const allAnswered = answers.every((i) => i !== -1);
  const locked = alreadyCompleted === true;
  const loading = alreadyCompleted === null;

  // Selección ágil
  const handleSelect = (qi: number, oi: number) => {
    if (submitted || locked) return;
    setAnswers(prev => {
      if (prev[qi] === oi) return prev;
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  };

  // Enviar resultados + logro idempotente
  const handleSubmit = useCallback(async () => {
    if (loading) return;
    if (!allAnswered || submitted || locked) {
      if (locked) {
        Alert.alert('Ya completado', 'Ya resolviste este cuestionario. No se puede aplicar de nuevo.');
      }
      return;
    }

    setSubmitted(true);

    try {
      const pass = score >= Math.ceil(QUESTIONS.length * 0.6);
      pass ? playCorrect() : playWrong();
    } catch {}

    const payload: AchievementPayload = {
      title: 'Primer mapache: cuestionario completado',
      description: 'Completaste tu primer Quiz Cultural en Nichiboku.',
      icon: 'mapache',
      badgeColor: '#D7B56D',
      points: 50,
      xp: 50,
      score,
      total: QUESTIONS.length,
      type: 'quiz',
      quizKey: 'QuizCultural',
      sub: 'quiz_cultural',
      version: 1,
      createdAt: Date.now(),
    };

    try {
      if (granting) return;
      setGranting(true);
      await awardAchievement('quiz_cultural_01', payload); // idempotente en servicio
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e: any) {
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('already')) {
        Alert.alert('Ya completado', 'Ya resolviste este cuestionario. No se puede aplicar de nuevo.');
      } else {
        console.warn('awardAchievement error:', e);
        Alert.alert('Ups', 'No se pudo registrar el logro por ahora. Intenta nuevamente más tarde.');
        setSubmitted(false);
      }
    } finally {
      setGranting(false);
    }
  }, [loading, allAnswered, submitted, locked, score, granting, playCorrect, playWrong]);

  // GATE: pantalla de carga (evita “primer tap fantasma”)
  if (loading) {
    return (
      <View style={s.loadingScreen}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" />
        <Text style={s.loadingTxt}>Revisando tu progreso…</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {locked && (
        <View style={s.lockBanner}>
          <Text style={s.lockTitle}>🔒 Ya resolviste este cuestionario</Text>
          <Text style={s.lockText}>
            No se puede aplicar de nuevo. {remoteScore != null ? `Tu puntaje registrado: ${remoteScore}/${QUESTIONS.length}.` : ''}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="always"   // 👈 evita que el scroll consuma el primer tap
      >
        <View style={s.header}>
          <Text style={s.title}>🎌 Quiz Cultural</Text>
          <Text style={s.subtitle}>
            {locked ? 'Progreso bloqueado' : `Responde y aprende sobre Japón • ${score}/${QUESTIONS.length}`}
          </Text>
        </View>

        {QUESTIONS.map((it, qi) => {
          const selected = answers[qi];
          return (
            <View key={qi} style={s.card}>
              <Text style={s.q}>{qi + 1}. {it.q}</Text>

              <View style={{ gap: 8, marginTop: 8 }}>
                {it.options.map((opt, oi) => {
                  const chosen = selected === oi;
                  return (
                    <TouchableOpacity
                      key={`${qi}-${oi}`}
                      onPressIn={() => handleSelect(qi, oi)} // 👈 respuesta al primer toque
                      delayPressIn={0}
                      disabled={submitted || locked}
                      activeOpacity={0.9}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={[s.option, chosen && !submitted && s.optionChosen]}
                    >
                      <Text style={s.optionTxt}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {submitted && !locked && <Text style={s.feedback}>ℹ️ {it.why}</Text>}
            </View>
          );
        })}

        {/* padding extra para que el contenido no quede bajo el footer */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Footer fijo FUERA del ScrollView para que no lo intercepte */}
      <View pointerEvents="box-none" style={s.footer}>
        <TouchableOpacity
          onPressIn={handleSubmit}            // 👈 primer toque inmediato
          delayPressIn={0}
          activeOpacity={0.9}
          style={[s.primaryBtn, (!allAnswered || locked) && { opacity: 0.5 }]}
          disabled={!allAnswered || locked}
        >
          <Text style={s.primaryBtnTxt}>
            {locked ? 'Cuestionario ya completado' : (submitted ? 'Resultados enviados' : 'Ver resultados')}
          </Text>
        </TouchableOpacity>
      </View>

      <AchievementToast
        visible={showToast}
        title="¡Logro desbloqueado!"
        subtitle="Primer mapache: cuestionario completado"
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  // Pantalla de carga (bloquea interacciones)
  loadingScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff',
  },
  loadingTxt: { color: '#374151' },

  // Banner bloqueo
  lockBanner: {
    backgroundColor: '#FFF7ED',
    borderBottomWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lockTitle: { color: '#7C2D12', fontWeight: '800' },
  lockText: { color: '#7C2D12', marginTop: 2 },

  container: { padding: 20, paddingBottom: 40 },

  header: {
    marginBottom: 14,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#e5e7eb', textAlign: 'center' },

  card: {
    backgroundColor: '#fdf6e3',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  q: { fontSize: 16, fontWeight: '700', color: '#111827' },

  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cfd6df',
    backgroundColor: '#ffffff',
  },
  optionChosen: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  optionTxt: { fontSize: 14, color: '#111827' },

  feedback: { marginTop: 10, fontSize: 13, color: '#374151' },

  // Footer fijo
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },

  primaryBtn: {
    backgroundColor: '#B3001B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Toast
  toast: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 4,
  },
  toastTitle: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 2, textAlign: 'center' },
  toastSubtitle: { color: '#e5e7eb', fontSize: 12, textAlign: 'center' },
});
