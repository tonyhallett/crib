import { Friendship } from "./generatedTypes";

interface FriendshipRequest {
  isInviter: true;
  friend: string;
  inviteDate: Date;
  fromServer: false;
}

export type ServerFriendship = Friendship & { fromServer: true };

export type LocalFriendship = ServerFriendship | FriendshipRequest;
