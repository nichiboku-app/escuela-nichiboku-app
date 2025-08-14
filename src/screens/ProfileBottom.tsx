// src/screens/ProfileBottom.tsx
import React from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileBottom() {
  return (
    <View style={styles.wrap}>
      {/* FILA 1 */}
      <View style={styles.row}>
        {/* Meta semanal */}
        <Card>
          <Image
            source={require('../../assets/icons/achievement_bg2.webp')}
            style={styles.bgSoft}
            resizeMode="cover"
          />
          <Text style={styles.cardTitle}>Meta semanal</Text>

          <View style={styles.metaRow}>
            <Image
              source={require('../../assets/icons/icono_circular.webp')}
              style={styles.metaCircle}
              resizeMode="contain"
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.metaBig}>3/5</Text>
              <Text style={styles.metaLabel}>Racha de{'\n'}estudio</Text>
            </View>
          </View>
        </Card>

        {/* Racha de estudio */}
        <Card>
          <Image
            source={require('../../assets/icons/achievement_bg2.webp')}
            style={styles.bgSoft}
            resizeMode="cover"
          />
          <Text style={styles.cardTitle}>Racha de estudio</Text>

          {/* Slider horizontal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            <IconWithLabel
              src={require('../../assets/icons/samurai.webp')}
              label="Samurai"
            />
            <LevelPill text="L1" />
            <LevelPill text="L3" icon={require('../../assets/icons/l3.webp')} />
            <LevelPill text="L5" icon={require('../../assets/icons/l5.webp')} />
          </ScrollView>
        </Card>
      </View>

      {/* FILA 2 */}
      <View style={styles.row}>
        {/* Logros */}
        <Card>
          <Image
            source={require('../../assets/icons/achievement_bg2.webp')}
            style={styles.bgSoft}
            resizeMode="cover"
          />
          <Text style={styles.cardTitle}>Logros</Text>

          {/* Slider horizontal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            <Achievement src={require('../../assets/icons/logro_n1.webp')} sub="N1" />
            <Achievement src={require('../../assets/icons/logro_n1.webp')} sub="N1" />
            <Achievement src={require('../../assets/icons/logro_n1.webp')} sub="N1" />
          </ScrollView>
        </Card>

        {/* Juegos */}
        <Card>
          <Image
            source={require('../../assets/icons/achievement_bg2.webp')}
            style={styles.bgSoft}
            resizeMode="cover"
          />
          <Text style={styles.cardTitle}>Juegos</Text>

          <View style={styles.gamesRow}>
            <Image
              source={require('../../assets/icons/juego_mapache.webp')}
              style={styles.gameIcon}
              resizeMode="contain"
            />
            <View style={styles.pointsBadge}>
              <Image
                source={require('../../assets/icons/juegos_puntos.webp')}
                style={styles.pointsImg}
                resizeMode="contain"
              />
              <Text style={styles.pointsTxt}>+150</Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

/* —————— Subcomponentes —————— */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require('../../assets/icons/fondo_decorativo.webp')}
      style={styles.card}
      imageStyle={styles.cardImage}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

function IconWithLabel({ src, label }: { src: any; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={src} style={styles.iconMid} resizeMode="contain" />
      <Text style={styles.smallLabel}>{label}</Text>
    </View>
  );
}

function LevelPill({ text, icon }: { text: string; icon?: any }) {
  return (
    <View style={styles.levelPill}>
      {icon ? <Image source={icon} style={styles.levelIcon} resizeMode="contain" /> : null}
      <Text style={styles.levelTxt}>{text}</Text>
    </View>
  );
}

function Achievement({ src, sub }: { src: any; sub: string }) {
  return (
    <View style={styles.achItem}>
      <Image source={src} style={styles.achIcon} resizeMode="contain" />
      <Text style={styles.achSub}>{sub}</Text>
    </View>
  );
}

/* —————— Estilos —————— */

const styles = StyleSheet.create({
  wrap: {
        paddingHorizontal: 16,
    paddingBottom: 32,   // ↑ un poco más para asegurar scroll visual
    gap: 14,
    // sin flex:1 aquí
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },

  card: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'flex-start',
  },
  cardImage: { borderRadius: 20 },
  bgSoft: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14, // fondo de montañitas MUY suave dentro de la tarjeta
  },

  // centrados
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    color: '#3b2b1b',
    textAlign: 'center',      // 👈 centrado
  },

  /* Meta semanal */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // 👈 centrado del contenido
    gap: 10,
  },
  metaCircle: { width: 64, height: 64 },
  metaBig: { fontSize: 24, fontWeight: '900', color: '#6b1f1f', textAlign: 'center' },
  metaLabel: { marginTop: 4, color: '#3b2b1b', textAlign: 'center' },

  /* Racha */
  hScroll: { gap: 10, alignItems: 'center', paddingHorizontal: 2 },
  iconMid: { width: 46, height: 46 },
  smallLabel: { marginTop: 4, fontSize: 12, color: '#3b2b1b' },

  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#efe2cf',
    borderWidth: 1,
    borderColor: '#caa378',
    gap: 6,
  },
  levelIcon: { width: 20, height: 20 },
  levelTxt: { fontWeight: '800', color: '#3b2b1b' },

  /* Logros */
  achItem: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#f6ead7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achIcon: { width: 40, height: 40 },
  achSub: { textAlign: 'center', fontSize: 12, marginTop: 6, color: '#3b2b1b' },

  /* Juegos */
  gamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  gameIcon: { width: 56, height: 56 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e7f6ea',
  },
  pointsImg: { width: 20, height: 20 },
  pointsTxt: { color: '#2f7a3b', fontWeight: '800' },
});
