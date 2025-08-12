import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PreguntasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Preguntas Frecuentes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  text: { fontSize: 20, fontWeight: 'bold' },
});
