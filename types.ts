export type RootStackParamList = {
  // Core
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Bienvenida: undefined;
  Home: undefined;

  // N5
  N5Bienvenida: undefined;
  EntradaActividadesN5: undefined;
  IntroJapones: undefined;
  TemaN5: { title?: string } | undefined;

  // Pantallas separadas N5
  OrigenesDelIdioma: undefined;
  EscrituraN5: undefined;
  CulturaN5: undefined;

  // Actividades
  QuizCultural: undefined;
  GifSaludo: undefined;

  // Ejercicios
  VowelExercises: undefined;

  // ⬇️ SCREEN DEL REPRODUCTOR (nombre tal cual tu archivo)
  VideoIntroModal: { videoId?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
