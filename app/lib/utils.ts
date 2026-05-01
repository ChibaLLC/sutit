import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatSecondsToTime = (seconds: number | null): string => {
  if (!seconds || seconds < 0) return "N/A";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
};

export const formatSecondsToDetailedTime = (
  seconds: number | null,
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  label: string;
} => {
  if (!seconds || seconds < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "N/A",
      label: "Not available",
    };
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let label = "";
  if (days > 0) label = `${days} day${days > 1 ? "s" : ""} `;
  if (hours > 0 || days > 0) {
    label += `${hours} hour${hours !== 1 ? "s" : ""} `;
  }
  if (minutes > 0 || hours > 0) {
    label += `${minutes} minute${minutes !== 1 ? "s" : ""} `;
  }
  label += `${secs} second${secs !== 1 ? "s" : ""}`;

  return {
    days,
    hours,
    minutes,
    seconds: secs,
    formatted: formatSecondsToTime(seconds),
    label: label.trim(),
  };
};

export const formatCountdown = (startTime: Date | string): string => {
  const start = new Date(startTime);
  const current = new Date();
  const diff = Math.floor((current.getTime() - start.getTime()) / 1000);

  return formatSecondsToTime(diff);
};

export const getTatStatus = (
  tatSeconds: number | null,
  targetSeconds?: number | null,
): "completed" | "in-progress" | "at-risk" | "overdue" => {
  if (!tatSeconds) return "completed";

  if (targetSeconds && targetSeconds > 0) {
    if (tatSeconds >= targetSeconds) return "overdue";
    if (tatSeconds >= targetSeconds * 0.8) return "at-risk";
  }

  return "in-progress";
};

export const getTatStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "at-risk":
      return "bg-yellow-100 text-yellow-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
