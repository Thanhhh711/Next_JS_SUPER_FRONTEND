import React, { useEffect } from "react";
import evnConfig from "../config";
export default function ClientComponent() {
  useEffect(() => {
    console.log(evnConfig);
  }, []);

  return <div>ClientComponent</div>;
}
