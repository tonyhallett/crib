interface HSLDemoProps {
  saturation: number;
  lightness: number;
  numColors: number;
}

function getColors(props: HSLDemoProps) {
  const huedelta = Math.trunc(360 / props.numColors);
  const colors: string[] = [];
  for (let i = 0; i < props.numColors; i++) {
    const color = `hsl(${i * huedelta},${props.saturation}%,${
      props.lightness
    }%)`;
    console.log(color);
    colors.push(color);
  }
  return colors;
}

export function HSLDemo(props: HSLDemoProps) {
  return (
    <>
      {getColors(props).map((color) => (
        <div key={color} style={{ backgroundColor: color }}>
          hello
        </div>
      ))}
    </>
  );
}
