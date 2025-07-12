"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Laptop, Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      className="rounded-full w-8 h-8 absolute top-4 right-4 z-40"
      variant={"ghost"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Moon /> : theme === "light" ? <Sun /> : <Laptop />}
    </Button>
  );
}
