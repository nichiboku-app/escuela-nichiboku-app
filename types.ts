export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  // CrearCuenta?: undefined; // si no se usa, deja comentado o bórralo
  Bienvenida: undefined;

  Home: undefined;

  // NAVEGACIÓN N5 / INTRO
  EntradaActividadesN5: undefined; // pantalla del logro
  IntroJapones: undefined;         // pantalla de introducción (destino)

  // N5
  N5Bienvenida: undefined;
  TemaN5: { title?: string } | undefined;

  // Ejercicios
  VowelExercises: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
