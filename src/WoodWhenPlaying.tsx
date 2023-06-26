import { GlobalStyles } from "@mui/material";

const woodUrl = new URL(
  "wood1.jpeg?as=webp",
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  import.meta.url
).toString();

export const WoodWhenPlaying = function (props: { playing: boolean }) {
  if (props.playing) {
    return (
      <GlobalStyles
        styles={{
          html: {
            background: `url(${woodUrl}) no-repeat center center fixed`,
            backgroundSize: "cover",
            webkitBackgroundSize: "cover",
            mozBackgroundSize: "cover",
            // -o-background-size: cover;
          },
        }}
      />
    );
  }
  return (
    <GlobalStyles
      styles={{
        html: {
          backgroundColor: `red`,
        },
      }}
    />
  );
};
