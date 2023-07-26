import * as signalR from "@microsoft/signalr";
import isParcelDevMode from "../utilities/isParcelDevMode";
import { RadHubConnectionBuilder } from "./RadHubConnectionBuilder";
import { jsonLocalStorageWithChange } from "./jsonLocalStorage";
import { inMemoryStorage } from "./inMemoryLocalStorage";
import { LocalMatch } from "../localMatch";
import { IStorage } from "./IStorage";
import { Auth0Provider as ActualAuth0Provider } from "@auth0/auth0-react";
import { Auth0Provider as RadAuth0Provider } from "./Auth0Provider";
import { RadHubManager } from "./RadHubManager";

let signalRX: Pick<typeof signalR, "HubConnectionBuilder"> = signalR;
interface ICribStorage {
  setMatch(match: LocalMatch): void;
  removeMatch(matchId: string): void;
  getMatch(matchId: string): LocalMatch | null;
}

class CribStorage implements ICribStorage {
  constructor(private storage: IStorage) {}

  private getMatchKey(matchId: string) {
    return `match-${matchId}`;
  }
  setMatch(match: LocalMatch): void {
    this.storage.setItem(this.getMatchKey(match.id), match);
  }
  removeMatch(matchId: string): void {
    this.storage.removeItem(this.getMatchKey(matchId));
  }
  getMatch(matchId: string): LocalMatch | null {
    return this.storage.getItem<LocalMatch>(this.getMatchKey(matchId));
  }
}

let storage: IStorage = jsonLocalStorageWithChange;
let Auth0Provider = ActualAuth0Provider;
const devMode = isParcelDevMode();
const Component = devMode ? <RadHubManager /> : undefined;
if (devMode) {
  Auth0Provider = RadAuth0Provider;
  signalRX = {
    HubConnectionBuilder: RadHubConnectionBuilder,
  };
  storage = inMemoryStorage;
}

const cribStorage = new CribStorage(storage);
export { signalRX, cribStorage, Auth0Provider, Component };
