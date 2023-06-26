/* eslint-disable complexity */
import * as signalR from "@microsoft/signalr";
import { TextMessageFormat } from "./TextMessageFormat";
import { dateReviver } from "../utilities/jsonDateReviver";

export class DateTransformingJsonHubProtocol implements signalR.IHubProtocol {
  name = "json";
  version = 1;
  transferFormat: signalR.TransferFormat = signalR.TransferFormat.Text;
  private jsonHubProtocol: signalR.JsonHubProtocol =
    new signalR.JsonHubProtocol();
  public parseMessages(
    input: string,
    logger: signalR.ILogger
  ): signalR.HubMessage[] {
    // The interface does allow "ArrayBuffer" to be passed in, but this implementation does not. So let's throw a useful error.
    if (typeof input !== "string") {
      throw new Error(
        "Invalid input for JSON hub protocol. Expected a string."
      );
    }

    if (!input) {
      return [];
    }

    if (logger === null) {
      logger = signalR.NullLogger.instance;
    }

    // Parse the messages
    const messages = TextMessageFormat.parse(input);

    const hubMessages: signalR.HubMessage[] = [];

    for (const message of messages) {
      const parsedMessage = JSON.parse(
        message,
        dateReviver
      ) as signalR.HubMessage;
      if (typeof parsedMessage.type !== "number") {
        throw new Error("Invalid payload.");
      }
      switch (parsedMessage.type) {
        case signalR.MessageType.Invocation:
          this._isInvocationMessage(parsedMessage);
          break;
        case signalR.MessageType.StreamItem:
          this._isStreamItemMessage(parsedMessage);
          break;
        case signalR.MessageType.Completion:
          this._isCompletionMessage(parsedMessage);
          break;
        case signalR.MessageType.Ping:
          // Single value, no need to validate
          break;
        case signalR.MessageType.Close:
          // All optional values, no need to validate
          break;
        default:
          // Future protocol changes can add message types, old clients can ignore them
          logger.log(
            signalR.LogLevel.Information,
            "Unknown message type '" + parsedMessage.type + "' ignored."
          );
          continue;
      }
      hubMessages.push(parsedMessage);
    }

    return hubMessages;
  }
  writeMessage(message: signalR.HubMessage): string | ArrayBuffer {
    return this.jsonHubProtocol.writeMessage(message);
  }

  // copying from JsonHubProtocol
  private _isInvocationMessage(message: signalR.InvocationMessage): void {
    this._assertNotEmptyString(
      message.target,
      "Invalid payload for Invocation message."
    );

    if (message.invocationId !== undefined) {
      this._assertNotEmptyString(
        message.invocationId,
        "Invalid payload for Invocation message."
      );
    }
  }

  private _isStreamItemMessage(message: signalR.StreamItemMessage): void {
    this._assertNotEmptyString(
      message.invocationId,
      "Invalid payload for StreamItem message."
    );

    if (message.item === undefined) {
      throw new Error("Invalid payload for StreamItem message.");
    }
  }

  private _isCompletionMessage(message: signalR.CompletionMessage): void {
    if (message.result && message.error) {
      throw new Error("Invalid payload for Completion message.");
    }

    if (!message.result && message.error) {
      this._assertNotEmptyString(
        message.error,
        "Invalid payload for Completion message."
      );
    }

    this._assertNotEmptyString(
      message.invocationId,
      "Invalid payload for Completion message."
    );
  }

  private _assertNotEmptyString(value: string, errorMessage: string): void {
    if (typeof value !== "string" || value === "") {
      throw new Error(errorMessage);
    }
  }
}
