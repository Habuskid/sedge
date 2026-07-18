import { AppKit } from '@circle-fin/app-kit';

let kitInstance: AppKit | null = null;

export function getAppKit(): AppKit {
  if (!kitInstance) {
    kitInstance = new AppKit();
  }
  return kitInstance;
}
