import * as signalR from "@microsoft/signalr";
import { PublicInterface } from "../utilities/typeHelpers";
import { RadHubConnectionInstance } from "./RadHubConnection";

export class RadHubConnectionBuilder
  implements PublicInterface<signalR.HubConnectionBuilder>
{
  configureLogging(logLevel: signalR.LogLevel): signalR.HubConnectionBuilder;
  configureLogging(logger: signalR.ILogger): signalR.HubConnectionBuilder;
  configureLogging(logLevel: string): signalR.HubConnectionBuilder;
  configureLogging(
    logging: string | signalR.LogLevel | signalR.ILogger
  ): signalR.HubConnectionBuilder;
  configureLogging(): signalR.HubConnectionBuilder {
    return this;
  }
  withUrl(url: string): signalR.HubConnectionBuilder;
  withUrl(
    url: string,
    transportType: signalR.HttpTransportType
  ): signalR.HubConnectionBuilder;
  withUrl(
    url: string,
    options: signalR.IHttpConnectionOptions
  ): signalR.HubConnectionBuilder;
  withUrl(): signalR.HubConnectionBuilder {
    return this;
  }
  withHubProtocol(): signalR.HubConnectionBuilder {
    return this;
  }
  withAutomaticReconnect(): signalR.HubConnectionBuilder;
  withAutomaticReconnect(retryDelays: number[]): signalR.HubConnectionBuilder;
  withAutomaticReconnect(
    reconnectPolicy: signalR.IRetryPolicy
  ): signalR.HubConnectionBuilder;
  withAutomaticReconnect(): signalR.HubConnectionBuilder {
    return this;
  }
  build(): signalR.HubConnection {
    return RadHubConnectionInstance as unknown as signalR.HubConnection;
  }
}
