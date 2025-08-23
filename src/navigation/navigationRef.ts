// Opción simple: tipamos el ref como `any` para evitar fricción con TS
import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function rootNavigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    // forma de 1 parámetro (objeto) evita sobrecarga de tuplas
    navigationRef.navigate({ name, params } as never);
  } else {
    console.warn('⚠️ NavigationContainer aún no está listo');
  }
}

export function rootPush(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name as never, params as never));
  } else {
    console.warn('⚠️ NavigationContainer aún no está listo (push)');
  }
}

export function rootReplace(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name as never, params as never));
  } else {
    console.warn('⚠️ NavigationContainer aún no está listo (replace)');
  }
}
