import { JsonReviver, dateReviver } from "../utilities/jsonDateReviver";

// note that the storage event is not fired in the same window that called localStorage.setItem(), localStorage.removeItem() or localStorage.clear(). It is fired in all other windows than the one that made the changes. See https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
interface StorageChangeEvent {
  key: string | undefined;
  value?: unknown;
}

type StorageChangeListener = (event: StorageChangeEvent) => void;
interface StorageChangeListenerAndKey {
  listener: StorageChangeListener;
  key?: string;
}

class StorageWithChange {
  private listeners: StorageChangeListenerAndKey[] = [];
  // note that the storage event is not fired in the same window that called localStorage.setItem(), localStorage.removeItem() or localStorage.clear(). It is fired in all other windows than the one that made the changes. See https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
  constructor(private storage: Storage) {}

  addListener(listener: StorageChangeListener, key?: string): void {
    this.listeners.push({ key, listener });
  }
  // need removal too

  /** Returns the number of key/value pairs. */
  length(): number {
    return this.storage.length;
  }
  /**
   * Removes all key/value pairs, if there are any.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  clear(): void {
    this.storage.clear();
    this.notifyListeners(undefined);
  }
  public notify = true;
  public notifyListeners(key: string | undefined, value?: unknown) {
    if (this.notify) {
      this.listeners.forEach((listenerAndKey) => {
        if (
          key === undefined ||
          listenerAndKey.key === undefined ||
          listenerAndKey.key === key
        ) {
          listenerAndKey.listener({ key, value });
        }
      });
    }
  }

  /** Returns the current value associated with the given key, or null if the given key does not exist. */
  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }
  /** Returns the name of the nth key, or null if n is greater than or equal to the number of key/value pairs. */
  key(index: number): string | null {
    return this.storage.key(index);
  }
  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
    this.notifyListeners(key);
  }
  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
    this.notifyListeners(key, false);
  }
  //[name: string]: any;
}

class JsonStorageWithChange {
  private storageWithChange: StorageWithChange;
  constructor(storage: Storage, private reviver?: JsonReviver) {
    this.storageWithChange = new StorageWithChange(storage);
  }

  addListener(listener: StorageChangeListener, key?: string): void {
    this.storageWithChange.addListener(listener, key);
  }

  /** Returns the number of key/value pairs. */
  length(): number {
    return this.storageWithChange.length();
  }
  /**
   * Removes all key/value pairs, if there are any.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  clear(): void {
    this.storageWithChange.clear();
  }
  /** Returns the current value associated with the given key, or null if the given key does not exist. */
  getItem<T>(key: string): T | null {
    const value = this.storageWithChange.getItem(key);
    if (value) {
      return JSON.parse(value, this.reviver);
    }
    return null;
  }
  /** Returns the name of the nth key, or null if n is greater than or equal to the number of key/value pairs. */
  key(index: number): string | null {
    return this.storageWithChange.key(index);
  }
  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  removeItem(key: string): void {
    this.storageWithChange.removeItem(key);
  }
  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
   *
   * Dispatches a storage event on Window objects holding an equivalent Storage object.
   */
  setItem(key: string, value: unknown): void {
    this.storageWithChange.notify = false;
    this.storageWithChange.setItem(key, JSON.stringify(value));
    this.storageWithChange.notify = false;
    this.storageWithChange.notifyListeners(key, value);
  }
  [name: string]: unknown;
}

class JsonLocalStorageWithChange extends JsonStorageWithChange {
  constructor() {
    super(window.localStorage, dateReviver);
  }
}

export const jsonLocalStorageWithChange = new JsonLocalStorageWithChange();
