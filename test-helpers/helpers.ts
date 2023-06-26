export function suppressActWarning() {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
}

export function restoreActWarning() {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
}
