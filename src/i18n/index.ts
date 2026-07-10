import { en, tr, es, pt, fr, de } from './locales-west';
import { ru, ar, hi, zh, ja, ko } from './locales-east';
import { LANG_NAMES, RTL_LANGS, type Dict } from './types';

export { LANG_NAMES, RTL_LANGS };

export const LOCALES: Record<string, Dict> = { en, tr, zh, hi, es, fr, ar, pt, ru, ja, de, ko };

export type TParams = Record<string, string | number>;

export function makeT(lang: string) {
  const dict = LOCALES[lang] ?? LOCALES.en;
  return (key: string, params?: TParams): string => {
    let s = dict[key] ?? LOCALES.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.split(`{${k}}`).join(String(v));
      }
    }
    return s;
  };
}

export function isRTL(lang: string): boolean {
  return RTL_LANGS.includes(lang);
}
