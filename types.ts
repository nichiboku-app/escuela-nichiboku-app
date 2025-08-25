// types.ts
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  // Si no usas CrearCuenta, coméntalo o elimínalo
  CrearCuenta?: undefined;
  Bienvenida: undefined;

  Home: undefined;        // Drawer principal
    EntradaActividadesN5: undefined;

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
