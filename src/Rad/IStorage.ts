export interface IStorage {
  setItem(key: string, value: unknown): void;
  removeItem(key: string): void;
  getItem<T>(key: string): T | null;
}
