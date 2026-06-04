"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function StudentPushEnable() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }
    if (Notification.permission === "granted" || Notification.permission === "denied") return;

    fetch("/api/student/push/subscribe", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.configured) setVisible(true);
      })
      .catch(() => {});
  }, []);

  async function enablePush() {
    setLoading(true);
    setStatus("");
    try {
      const configRes = await fetch("/api/student/push/subscribe");
      const config = await configRes.json();
      if (!config.publicKey) {
        setStatus("Push not available yet.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notifications blocked. Enable them in browser settings.");
        setVisible(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config.publicKey),
        });
      }

      const res = await fetch("/api/student/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      const data = await res.json();
      if (data.success) {
        setVisible(false);
      } else {
        setStatus(data.message || "Could not enable notifications");
      }
    } catch {
      setStatus("Could not enable notifications on this device.");
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="student-push-prompt">
      <div className="student-push-prompt__icon" aria-hidden="true">
        <i className="fas fa-bell" />
      </div>
      <div className="student-push-prompt__body">
        <strong>Get phone alerts</strong>
        <span>Homework, fees, holidays &amp; messages — even when the app is closed</span>
        {status && <span className="student-push-prompt__error">{status}</span>}
      </div>
      <button type="button" className="btn btn-sm btn-orange" disabled={loading} onClick={enablePush}>
        {loading ? "…" : "Enable"}
      </button>
      <button type="button" className="student-push-prompt__dismiss" onClick={() => setVisible(false)} aria-label="Dismiss">
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    </div>
  );
}
