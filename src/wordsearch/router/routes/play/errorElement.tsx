import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function PlayError() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 5000);
  }, []);
  return (
    <>
      <div>WordSearch not found. Going home in 5 seconds</div>
    </>
  );
}
