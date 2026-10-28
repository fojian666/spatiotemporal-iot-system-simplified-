import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { initialState } from '../data/fixtures';
import { appReducer } from '../lib/appReducer';
import type { AppAction } from '../lib/appReducer';
import { parseAppState } from '../lib/appState';
import { loadStoredValue, saveStoredValue } from '../lib/storage';
import type { AppState } from '../types';

interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => boolean;
  storageError: string;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = 'industry-llm-platform-state-v1';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(() => {
    try {
      const stored = loadStoredValue<unknown>(STORAGE_KEY, initialState, window.localStorage);
      return parseAppState(stored, initialState);
    } catch {
      return initialState;
    }
  });
  const currentState = useRef(state);
  const [storageError, setStorageError] = useState('');

  const dispatch = useCallback((action: AppAction) => {
    const nextState = appReducer(currentState.current, action);
    let saved: boolean;
    try {
      saved = saveStoredValue(STORAGE_KEY, nextState, window.localStorage);
    } catch {
      saved = false;
    }
    if (!saved) {
      setStorageError('浏览器存储空间不足或不可用，本次更改未保存。原有数据保持不变，请释放空间或允许本地存储后重试。');
      return false;
    }
    currentState.current = nextState;
    setState(nextState);
    setStorageError('');
    return true;
  }, []);

  return <AppContext.Provider value={{ state, dispatch, storageError }}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
