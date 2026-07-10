import { createContext, useContext, useSyncExternalStore } from 'react';
import { engine } from './game/engine';
import { makeT, type TParams } from './i18n';

export function useGame() {
  useSyncExternalStore(engine.subscribe, engine.getVersion);
  return engine;
}

export type TFunc = (key: string, params?: TParams) => string;

export const TContext = createContext<TFunc>(makeT('en'));
export const useT = (): TFunc => useContext(TContext);

/** watchAd wrapper provided by App (handles simulated ads + reward toasts) */
export const AdContext = createContext<(onReward: () => void) => void>(() => {});
export const useWatchAd = () => useContext(AdContext);
