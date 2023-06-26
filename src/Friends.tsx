import { IconButton } from "@mui/material";
import { LocalFriendship } from "./LocalMyFriend";
import { SortableTable, TableRowData } from "./SortableTable";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { sortHeadCells } from "./sortHeadCells";
import { CribHub, FriendshipStatus } from "./generatedTypes";
import { TableDisplayDate } from "./TableDisplayDate";

interface FriendsDisplay {
  friend: string;
  isInviter: boolean;
  inviteDate: TableDisplayDate;
  status: string;
}
const propertyNames: (keyof FriendsDisplay)[] = [
  "friend",
  "isInviter",
  "status",
  "inviteDate",
];

const sortedHeadCells = sortHeadCells(propertyNames, [
  {
    property: "friend",
    disablePadding: false,
    label: "Friend",
    numeric: false,
  },
  {
    property: "isInviter",
    disablePadding: false,
    label: "Inviter",
    numeric: false,
  },
  {
    property: "status",
    disablePadding: false,
    label: "Status",
    numeric: false,
  },
  {
    property: "inviteDate",
    disablePadding: false,
    label: "Invite date",
    numeric: false,
  },
]);

sortedHeadCells.push({
  numeric: false,
  disablePadding: false,
  label: "Accept",
});

export function Friends(props: {
  friendships: LocalFriendship[];
  acceptFriendship: CribHub["acceptFriendRequest"];
}) {
  const rows: TableRowData<FriendsDisplay>[] = props.friendships.map(
    (friendship) => {
      const status = friendship.fromServer
        ? friendship.status.toString()
        : "waiting server";
      const value = {
        friend: friendship.friend,
        inviteDate: new TableDisplayDate(friendship.inviteDate),
        isInviter: friendship.isInviter,
        status: status,
      };
      const additionalElement: JSX.Element =
        friendship.fromServer &&
        friendship.status === FriendshipStatus.Pending ? (
          <IconButton onClick={() => props.acceptFriendship(friendship)}>
            <ThumbUpOffAltIcon />
          </IconButton>
        ) : (
          <></>
        );
      return {
        key: friendship.fromServer
          ? friendship.id
          : `request__${friendship.friend}`,
        value: value,
        additionalElements: [additionalElement],
      };
    }
  );
  return (
    <SortableTable
      propertyNames={propertyNames}
      headCells={sortedHeadCells}
      initialOrderBy="status"
      initialOrder="asc"
      rows={rows}
    />
  );
}
