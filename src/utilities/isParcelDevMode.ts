export default function isParcelDevMode() {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "test") return false;
  return nodeEnv !== "production";
}
