// src/screens/CursoN5Screen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type RootStackParamList = {
  Home: undefined;
  CursoN5: undefined;
  ActividadesN5: undefined;
  ExamenN5: undefined;
  PlanN5: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CursoN5Screen() {
  const navigation = useNavigation<Nav>();

  const go = (route: keyof RootStackParamList) => {
    try {
      // @ts-ignore (por si aún no existe la ruta en tu stack)
      navigation.navigate(route);
    } catch {
      Alert.alert('Ruta no encontrada', `Agrega la pantalla "${route}" en tu navigator.`);
    }
  };

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Encabezado */}
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>Nivel N5 • 初級</Text>
        </View>
        <Text style={styles.title}>Curso de Japonés N5</Text>
        <Text style={styles.subtitle}>
          Presentación del nivel y acceso a tus actividades.
        </Text>

        {/* Portada juvenil dentro del cuadro blanco */}
        <View style={styles.coverWrap}>
          <Image
            source={require('../../assets/images/n5_cover_youth.webp')}
            style={styles.cover}
            resizeMode="cover"
          />
        </View>

        {/* Qué aprenderás */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¿Qué aprenderás?</Text>
          <View style={styles.list}>
            <Text style={styles.item}>・Hiragana y Katakana completos</Text>
            <Text style={styles.item}>・Vocabulario esencial (saludos, familia, tiempo)</Text>
            <Text style={styles.item}>・Gramática básica: です／ます, これ/それ/あれ, partículas は・が・を・に</Text>
            <Text style={styles.item}>・Verbos en forma -ます (presente, pasado, negativo)</Text>
            <Text style={styles.item}>・Lectura de oraciones simples y comprensión auditiva</Text>
            <Text style={styles.item}>・Entre otros 100 temas más...</Text>
          </View>
        </View>

        {/* Requisitos y método */}
        <View style={styles.grid2}>
          <View style={[styles.card, styles.col]}>
            <Text style={styles.cardTitle}>Requisitos</Text>
            <View style={styles.list}>
              <Text style={styles.item}>・Cero o poca base de japonés</Text>
              <Text style={styles.item}>・15 min diarios de estudio recomendado</Text>
              <Text style={styles.item}>・Cuaderno para notas ✏️</Text>
            </View>
          </View>
          <View style={[styles.card, styles.col]}>
            <Text style={styles.cardTitle}>Método</Text>
            <View style={styles.list}>
              <Text style={styles.item}>・Actividades interactivas y mini-exámenes</Text>
              <Text style={styles.item}>・Audio nativo para pronunciación</Text>
              <Text style={styles.item}>・Gamificación: puntos y logros</Text>
            </View>
          </View>
        </View>

        {/* Incluye */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incluye</Text>
          <View style={styles.pillsRow}>
            <Text style={styles.pill}>🎧 Escucha</Text>
            <Text style={styles.pill}>🗣️ Pronunciación</Text>
            <Text style={styles.pill}>📝 Lecturas</Text>
            <Text style={styles.pill}>🎮 Juegos</Text>
            <Text style={styles.pill}>📊 Progreso</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => go('ActividadesN5')}>
            <Text style={styles.btnPrimaryText}>Entrar a las actividades N5</Text>
          </TouchableOpacity>

          <View style={styles.row2}>
            <TouchableOpacity style={styles.btnGhost} onPress={() => go('ExamenN5')}>
              <Text style={styles.btnGhostText}>Examen diagnóstico</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={() => go('PlanN5')}>
              <Text style={styles.btnGhostText}>comprar membresia</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnLink} onPress={() => go('Home')}>
            <Text style={styles.btnLinkText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>

        {/* Nota de avance */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            Consejo: completa 1–2 actividades por día. Tu avance y logros aparecerán aquí cuando
            conectemos tu perfil.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fondo liso blanco (adiós pergamino)
  bg: { flex: 1, backgroundColor: '#ffffff' },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },

  // Encabezado
  badgeRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 6 },
  badge: {
    backgroundColor: 'rgba(191, 23, 28, 0.12)',
    color: '#8c1014',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '600',
    fontSize: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1d1d1f', marginTop: 4 },
  subtitle: { fontSize: 14, color: '#4b5563', marginTop: 4, marginBottom: 12 },

  // Portada
  coverWrap: {
    width: '100%',
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  cover: { width: '100%', height: '100%' },

  // Tarjetas
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ececec',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 8 },
  list: { gap: 6 },
  item: { color: '#374151', fontSize: 14, lineHeight: 20 },

  // Grid 2 columnas (se apilan si no cabe)
  grid2: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  col: { flexBasis: '48%', flexGrow: 1 },

  // Chips
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(191, 23, 28, 0.08)',
    color: '#8c1014',
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
  },

  // CTA
  ctaWrap: { marginTop: 8, alignItems: 'stretch', gap: 10 },
  btnPrimary: {
    backgroundColor: '#bf171c',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  row2: { flexDirection: 'row', gap: 10 },
  btnGhost: {
    flex: 1,
    backgroundColor: 'rgba(191, 23, 28, 0.07)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 23, 28, 0.25)',
  },
  btnGhostText: { color: '#8c1014', fontWeight: '700' },
  btnLink: { alignSelf: 'center', paddingVertical: 8 },
  btnLinkText: { color: '#8c1014', fontWeight: '700', textDecorationLine: 'underline' },

  // Nota
  note: {
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  noteText: { fontSize: 12, color: '#6b7280' },
});
