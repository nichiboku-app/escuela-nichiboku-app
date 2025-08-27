// src/types.ts
export type N5SubtemaKey = 'origenes' | 'escritura' | 'cultura';

export type RootStackParamList = {
  // Arranque / auth / home
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Bienvenida: undefined;
  Home: undefined;

  // N5
  N5Bienvenida: undefined;
  EntradaActividadesN5: undefined;
  IntroJapones: undefined;
  OrigenesDelIdioma: undefined;

  // 👇 Subtema genérico con parámetro OBLIGATORIO
  Subtema: { key: N5SubtemaKey };

  // Otros
  TemaN5: { title?: string } | undefined;
  VowelExercises: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
