import { Orientation } from "../../hook/reducer/state-types";
import EastIcon from "@mui/icons-material/East";
import WestIcon from "@mui/icons-material/West";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";

export const iconMap = new Map<Orientation, React.ElementType>();
iconMap.set(Orientation.LeftToRight, EastIcon);
iconMap.set(Orientation.RightToLeft, WestIcon);
iconMap.set(Orientation.TopToBottom, SouthIcon);
iconMap.set(Orientation.BottomToTop, NorthIcon);
iconMap.set(Orientation.TopLeftToBottomRight, SouthEastIcon);
iconMap.set(Orientation.BottomRightToTopLeft, NorthWestIcon);
iconMap.set(Orientation.TopRightToBottomLeft, SouthWestIcon);
iconMap.set(Orientation.BottomLeftToTopRight, NorthEastIcon);
