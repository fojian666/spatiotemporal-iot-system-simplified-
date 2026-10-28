export const loadStoredValue = <T>(key: string, fallback: T, storage: Storage): T => {
  try {
    const value = storage.getItem(key);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
};

export const saveStoredValue = <T>(key: string, value: T, storage: Storage): boolean => {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
