import EventEmitter from "events";

export type BaseOnListener = Parameters<EventEmitter["on"]>[1];
type ArgType<T> = T extends Array<unknown> ? T : [T];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyVoidFunction = (...args: any[]) => void;

export type TypedListener<T> = T extends AnyVoidFunction
  ? T
  : (...args: ArgType<T>) => void;

export class StronglyTypedEventEmitter<T extends object> {
  private baseEmitter: EventEmitter = new EventEmitter();

  on<K extends keyof T>(event: K, listener: TypedListener<T[K]>) {
    // Delegate to the baseEmitter to register the listener with the provided event name
    this.baseEmitter.on(event as string, listener as BaseOnListener);
  }

  protected emit<K extends keyof T>(
    event: K,
    ...args: Parameters<TypedListener<T[K]>>
  ) {
    // Delegate to the baseEmitter to emit the event with the strongly typed payload
    this.baseEmitter.emit(event as string, ...args);
  }
}
