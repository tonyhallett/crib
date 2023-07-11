import * as signalR from "@microsoft/signalr";
import { PublicInterface } from "../utilities/typeHelpers";

export type SendInterceptor = (methodName: string, ...args: unknown[]) => unknown;

class RadHubConnection implements PublicInterface<signalR.HubConnection> {
  serverTimeoutInMilliseconds = 0;
  keepAliveIntervalInMilliseconds = 0;

  private listeners: Map<string, (...args: unknown[]) => unknown> = new Map();

  get state(): signalR.HubConnectionState {
    throw new Error("Method not implemented.");
  }
  get connectionId(): string | null {
    throw new Error("Method not implemented.");
  }
  get baseUrl(): string {
    throw new Error("Method not implemented.");
  }
  set baseUrl(url: string) {
    throw new Error("Method not implemented.");
  }
  start(): Promise<void> {
    return Promise.resolve();
  }
  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  stream<T = unknown>(): signalR.IStreamResult<T> {
    throw new Error("Method not implemented.");
  }

  private sendInterceptors: SendInterceptor[] = [];
  interceptSend(interceptor:SendInterceptor){
    this.sendInterceptors.push(interceptor);
  }

  // to the server
  send(methodName: string, ...args: unknown[]): Promise<void> {
    this.sendInterceptors.forEach(interceptor => interceptor(methodName, ...args));
    return Promise.resolve();
  }
  invoke<T = unknown>(): Promise<T> {
    throw new Error("Method not implemented.");
  }
  on(methodName: string, newMethod: (...args: unknown[]) => unknown): void {
    this.listeners.set(methodName, newMethod);
  }

  fromTheServer(methodName: string, ...args: unknown[]) {
    const listener = this.listeners.get(methodName);
    if (listener) {
      listener(...args);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  off(methodName: string, method?: (...args: unknown[]) => void): void {
    this.listeners.delete(methodName);
  }

  onclose(): void {
    //
  }
  onreconnecting(): void {
    throw new Error("Method not implemented.");
  }
  onreconnected(): void {
    throw new Error("Method not implemented.");
  }
}

export const RadHubConnectionInstance = new RadHubConnection();
