// src/hooks/useBrowserNotifications.ts
import { useEffect, useRef, useState } from "react";
import { useMockAuth } from "@/hooks/useMockAuth";

/**
 * Pure-frontend browser notifications hook (no Supabase, no network).
 * - Requests notification permission
 * - Optionally simulates dummy notifications on an interval
 */
export const useBrowserNotifications = (options?: {
  /** fire one demo notification ~5s after permission granted */
  demoOnce?: boolean;
  /** simulate ongoing dummy notifications every N ms (min 10s) */
  demoIntervalMs?: number | null;
}) => {
  const { user } = useMockAuth();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const intervalRef = useRef<number | null>(null);
  const {
    demoOnce = true,
    demoIntervalMs = null, // e.g., 60_000 to test every minute
  } = options || {};

  const isSupported = typeof window !== "undefined" && "Notification" in window;

  // Initialize permission state
  useEffect(() => {
    if (isSupported) setPermission(Notification.permission);
  }, [isSupported]);

  // Demo notifications (pure frontend)
  useEffect(() => {
    // Guard conditions
    if (!isSupported || !user || permission !== "granted") return;

    // Fire a one-off demo notification after 5s
    let timeoutId: number | null = null;
    if (demoOnce) {
      timeoutId = window.setTimeout(() => {
        try {
          new Notification("New Hourly Task Assigned (Demo)", {
            body: `Hi ${user.first_name ?? "there"} — your ${new Date().getHours()}:00 demo task is ready.`,
            icon: "/favicon.ico",
            tag: `demo-hourly-task-${Date.now()}`,
          });
        } catch {
          // Ignore errors from blocked notifications
        }
      }, 5000);
    }

    // Optional repeating demo notifications
    if (demoIntervalMs && demoIntervalMs >= 10_000) {
      const topics = [
        "Timesheet reminder",
        "Project update",
        "New comment",
        "Task assigned",
        "Standup starts soon",
      ];
      intervalRef.current = window.setInterval(() => {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        try {
          new Notification(`${topic} (Demo)`, {
            body: `This is a simulated notification for ${user.first_name ?? "you"}.`,
            icon: "/favicon.ico",
            tag: `demo-${topic.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          });
        } catch {
          // Ignore errors
        }
      }, demoIntervalMs) as unknown as number;
    }

    // Cleanup
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSupported, user, permission, demoOnce, demoIntervalMs]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) return "denied";
    if (permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return permission;
  };

  return {
    permission,
    requestPermission,
    isSupported,
  };
};
