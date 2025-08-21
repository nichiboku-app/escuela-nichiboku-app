// src/utils/nav.ts
import { DrawerActions, type NavigationProp } from '@react-navigation/native';

/** Abre el Drawer aunque la pantalla esté anidada en varios Stacks. */
export function openDrawerDeep(navigation: NavigationProp<any>): boolean {
  // 1) Si definiste id en el Drawer (AppDrawer), intenta directo
  // @ts-ignore compat versiones
  const byId = (navigation as any)?.getParent?.('AppDrawer');
  if (byId?.openDrawer) { byId.openDrawer(); return true; }

  // 2) Recorre padres hasta hallar un Drawer con openDrawer
  // @ts-ignore
  let parent: any = (navigation as any)?.getParent?.();
  while (parent && typeof parent.openDrawer !== 'function') {
    parent = parent.getParent?.();
  }
  if (parent?.openDrawer) { parent.openDrawer(); return true; }

  // 3) Fallback: intenta dispatch sobre el primer parent
  // @ts-ignore
  const p: any = (navigation as any)?.getParent?.();
  if (p?.dispatch) { p.dispatch(DrawerActions.openDrawer()); return true; }

  return false;
}

/** Cierra el Drawer si existe en la jerarquía. */
export function closeDrawerDeep(navigation: NavigationProp<any>): boolean {
  // @ts-ignore
  const byId = (navigation as any)?.getParent?.('AppDrawer');
  if (byId?.closeDrawer) { byId.closeDrawer(); return true; }

  // @ts-ignore
  let parent: any = (navigation as any)?.getParent?.();
  while (parent && typeof parent.closeDrawer !== 'function') {
    parent = parent.getParent?.();
  }
  if (parent?.closeDrawer) { parent.closeDrawer(); return true; }

  // @ts-ignore
  const p: any = (navigation as any)?.getParent?.();
  if (p?.dispatch) { p.dispatch(DrawerActions.closeDrawer()); return true; }

  return false;
}
