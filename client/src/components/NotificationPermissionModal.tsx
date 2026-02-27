/**
 * NotificationPermissionModal - Asks the lojista to enable browser notifications.
 * Shows once after login if permission hasn't been asked yet.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import {
  wasNotificationPermissionAsked,
  isNotificationPermissionGranted,
  requestNotificationPermission,
  setNotificationPermissionAsked,
} from "@/hooks/useOrderNotifications";

export default function NotificationPermissionModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show if:
    // 1. Browser supports notifications
    // 2. Permission hasn't been asked yet
    // 3. Permission isn't already granted
    if (!("Notification" in window)) return;
    if (wasNotificationPermissionAsked()) return;
    if (isNotificationPermissionGranted()) return;

    // Small delay so it doesn't flash immediately on load
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleActivate = async () => {
    await requestNotificationPermission();
    setOpen(false);
  };

  const handleDismiss = () => {
    setNotificationPermissionAsked();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Bell className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <DialogTitle className="text-xl text-white">
            Ative as notificações de pedidos
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
            Receba um alerta instantâneo no seu celular ou computador sempre que
            chegar um pedido novo — mesmo com o navegador minimizado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Agora não
          </Button>
          <Button
            onClick={handleActivate}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            Ativar Notificações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
