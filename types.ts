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

  // Hiragana Grupo A
  TrazosGrupoA: undefined;
  PronunciacionGrupoA: undefined;
  EjemplosGrupoA: undefined;

  // Implementadas nuevas
  ATarjetas: undefined;
  ATrazoAnimado: undefined;
  ADictadoVisual: undefined;

  // Placeholders varios
  TarjetasGrupoA: undefined;
  TrazoAnimadoGrupoA: undefined;
  DictadoVisualGrupoA: undefined;

  // Grupo K
  TrazoGrupoK: undefined;
  PronunciacionGrupoK: undefined;
  VocabularioGrupoK: undefined;
  MatchingGrupoK: undefined;
  MemoriaGrupoK: undefined;

  // Familias S/T
  FamiliaS: undefined;

  // Grupo S
  SEscrituraGrupoS: undefined;
  SEjemplosGrupoS: undefined;
  SCaligrafiaDigital: undefined;
  SLecturaSilabas: undefined;

  // Grupo T
  TTrazoGif: undefined;
  TQuizEscucha: undefined;
  FamiliaNH: undefined;
  NLecturaGuiada: undefined;
  HRoleplaySaludo: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
