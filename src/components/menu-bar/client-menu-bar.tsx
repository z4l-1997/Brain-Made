"use client";

import { useState, useEffect } from "react";
import StaticMenuBar from "./static-menu-bar";
import MenuBar from "./menu-bar";

export default function ClientMenuBar() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <StaticMenuBar />;
  }

  return <MenuBar />;
}
