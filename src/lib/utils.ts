import { clsx, type ClassValue } from "clsx";
import { randomInt } from "node:crypto";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAccountNumber = () => {
  const num = randomInt(1, 1000);
  return num.toString().padStart(3, "0");
};
