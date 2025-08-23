// types.ts
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  CrearCuenta: undefined; // si no la usas, puedes quitarla
  Bienvenida: undefined;

  Home: undefined;        // Drawer principal

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
