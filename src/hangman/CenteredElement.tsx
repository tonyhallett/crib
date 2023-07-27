import { Box } from "@mui/material";

export function CenteredElement(props: { children: React.ReactNode }) {
  return (
    <Box display="flex" justifyContent="center">
      {props.children}
    </Box>
  );
}
