import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PoliticaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Política de Privacidad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  text: { fontSize: 20, fontWeight: 'bold' },
});
