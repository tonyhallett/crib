import * as signalR from "@microsoft/signalr";
import isParcelDevMode from "../utilities/isParcelDevMode";
import { RadHubConnectionBuilder } from "./RadHubConnectionBuilder";
import { jsonLocalStorageWithChange } from "./jsonLocalStorage";
import { inMemoryStorage } from "./inMemoryLocalStorage";
import { LocalMatch } from "../LocalMatch";
import { IStorage } from "./IStorage";

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
const devMode = isParcelDevMode();

if (devMode) {
  signalRX = {
    HubConnectionBuilder: RadHubConnectionBuilder,
  };
  storage = inMemoryStorage;
}
const cribStorage = new CribStorage(storage);
export { signalRX, cribStorage };
