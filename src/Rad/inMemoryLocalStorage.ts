import { IStorage } from "./IStorage";

const storage: Record<string, unknown> = {};
export const inMemoryStorage: IStorage = {
  setItem: function (key: string, value: unknown): void {
    storage[key] = value;
  },
  removeItem: function (key: string): void {
    delete storage[key];
  },
  getItem: function <T>(key: string): T | null {
    return (storage[key] as T) || null;
  },
};
