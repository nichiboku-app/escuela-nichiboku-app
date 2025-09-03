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
  Hiragana: undefined;
  TemaN5: { title?: string } | undefined;

  // Pantallas separadas N5
  OrigenesDelIdioma: undefined;
  EscrituraN5: undefined;
  CulturaN5: undefined;

  // Actividades intro
  QuizCultural: undefined;
  GifSaludo: undefined;

  // Ejercicios
  VowelExercises: undefined;

  // Reproductor
  VideoIntroModal: { videoId?: string } | undefined;

  // === Nuevo: Hiragana Grupo A ===
  TrazosGrupoA: undefined;
  PronunciacionGrupoA: undefined;
  EjemplosGrupoA: undefined;

  // Actividades Grupo A
  TarjetasGrupoA: undefined;
  TrazoAnimadoGrupoA: undefined;
  DictadoVisualGrupoA: undefined;

  // === Nuevo: Hiragana Grupo K ===
  TrazoGrupoK: undefined;
  VocabularioGrupoK: undefined;

  // Actividades Grupo K
  MatchingGrupoK: undefined;
  MemoriaGrupoK: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
