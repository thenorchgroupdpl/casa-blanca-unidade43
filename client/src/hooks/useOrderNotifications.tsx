/**
 * useOrderNotifications - SSE hook for real-time order notifications.
 * Handles: SSE connection, reconnection with exponential backoff,
 * sound (Web Audio API), native browser notifications, badge count.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ============================================
// TYPES
// ============================================

export interface OrderEvent {
  orderId: number;
  customerName: string;
  total: number;
  itemCount: number;
  createdAt: string;
  zone: string;
}

// ============================================
// WEB AUDIO API - Beep Sound
// ============================================

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playDoubleBeep(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // First beep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 880;
    gain1.gain.value = 0.3;
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Second beep (150ms gap)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.value = 880;
    gain2.gain.value = 0.3;
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.35);
  } catch (err) {
    console.warn("[Audio] Failed to play notification sound:", err);
  }
}

// ============================================
// NATIVE BROWSER NOTIFICATION
// ============================================

function showNativeNotification(event: OrderEvent, storeName: string): void {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const n = new Notification(`🛒 Novo Pedido — ${storeName}`, {
      body: `${event.customerName} · R$ ${event.total.toFixed(2)}`,
      icon: "/favicon.ico",
      tag: `order-${event.orderId}`,
    });

    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch (err) {
    console.warn("[Notification] Failed to show native notification:", err);
  }
}

// ============================================
// SOUND PREFERENCE
// ============================================

const SOUND_PREF_KEY = "casa-blanca-notification-sound";

export function getSoundEnabled(): boolean {
  const saved = localStorage.getItem(SOUND_PREF_KEY);
  return saved !== "false"; // default true
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_PREF_KEY, enabled ? "true" : "false");
}

// ============================================
// NOTIFICATION PERMISSION
// ============================================

const NOTIF_ASKED_KEY = "casa-blanca-notification-asked";

export function wasNotificationPermissionAsked(): boolean {
  return localStorage.getItem(NOTIF_ASKED_KEY) === "true";
}

export function setNotificationPermissionAsked(): void {
  localStorage.setItem(NOTIF_ASKED_KEY, "true");
}

export function isNotificationPermissionGranted(): boolean {
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  setNotificationPermissionAsked();
  const result = await Notification.requestPermission();
  return result === "granted";
}

// ============================================
// HOOK
// ============================================

interface UseOrderNotificationsReturn {
  isConnected: boolean;
  lastOrder: OrderEvent | null;
  unviewedCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
}

export function useOrderNotifications(
  storeName: string = "Casa Blanca"
): UseOrderNotificationsReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderEvent | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  const utils = trpc.useUtils();

  // Unviewed count query
  const { data: unviewedData } = trpc.orders.unviewedCount.useQuery(undefined, {
    refetchInterval: 60_000, // Fallback poll every 60s
  });

  const unviewedCount = unviewedData?.count ?? 0;

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      return next;
    });
  }, []);

  // Handle new order event
  const handleNewOrder = useCallback(
    (event: OrderEvent) => {
      setLastOrder(event);

      // Play sound if enabled
      if (getSoundEnabled()) {
        playDoubleBeep();
      }

      // Show native notification
      showNativeNotification(event, storeName);

      // Show custom toast
      const itemText = event.itemCount === 1 ? "1 item" : `${event.itemCount} itens`;
      toast(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <span className="font-bold text-white">Novo Pedido Recebido!</span>
          </div>
          <p className="text-sm text-zinc-300">
            {event.customerName} · {itemText} · R$ {event.total.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500">
            {event.zone === "Retirada no Local" ? "Retirada no Local" : `Entrega: ${event.zone}`}
          </p>
        </div>,
        {
          duration: 10_000,
          action: {
            label: "Ver Pedido",
            onClick: () => {
              window.location.href = `/admin/dashboard/orders?highlight=${event.orderId}`;
            },
          },
          className: "!border-l-4 !border-l-amber-500 !bg-zinc-900 !text-white",
        }
      );

      // Invalidate queries to refresh data
      utils.orders.unviewedCount.invalidate();
      utils.orders.list.invalidate();
    },
    [storeName, utils]
  );

  // Connect to SSE
  useEffect(() => {
    mountedRef.current = true;

    function connect() {
      if (!mountedRef.current) return;

      try {
        const es = new EventSource("/api/events/orders");
        eventSourceRef.current = es;

        es.addEventListener("connected", () => {
          if (!mountedRef.current) return;
          setIsConnected(true);
          retryCountRef.current = 0;
          console.log("[SSE] Connected to order events");
        });

        es.addEventListener("new_order", (e) => {
          if (!mountedRef.current) return;
          try {
            const data: OrderEvent = JSON.parse(e.data);
            handleNewOrder(data);
          } catch (err) {
            console.error("[SSE] Failed to parse order event:", err);
          }
        });

        es.onerror = () => {
          if (!mountedRef.current) return;
          setIsConnected(false);
          es.close();
          eventSourceRef.current = null;

          // Exponential backoff: 1s, 2s, 4s, 8s, ... max 30s
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30_000);
          retryCountRef.current++;
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${retryCountRef.current})`);

          retryTimeoutRef.current = setTimeout(connect, delay);
        };
      } catch (err) {
        console.error("[SSE] Failed to create EventSource:", err);
      }
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [handleNewOrder]);

  return {
    isConnected,
    lastOrder,
    unviewedCount,
    soundEnabled,
    toggleSound,
  };
}
