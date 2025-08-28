// types.ts
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
  OrigenesDelIdioma: undefined; // pantalla larga “maratón”
  EscrituraN5: undefined;
  CulturaN5: undefined;


  // Actividades usadas en IntroJaponesScreen (regístralas en App.tsx si las usarás)
  VideoIntro?: undefined;
  QuizCultural?: undefined;
  GifSaludo?: undefined;

  // Ejercicios
  VowelExercises: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
