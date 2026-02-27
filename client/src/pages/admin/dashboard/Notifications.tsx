import { trpc } from "@/lib/trpc";
import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  CheckCheck,
  DollarSign,
  Info,
  AlertTriangle,
  Settings,
  Clock,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  billing: { icon: DollarSign, color: "text-amber-400 bg-amber-500/10", label: "Cobrança" },
  system: { icon: Settings, color: "text-blue-400 bg-blue-500/10", label: "Sistema" },
  info: { icon: Info, color: "text-cyan-400 bg-cyan-500/10", label: "Informação" },
  warning: { icon: AlertTriangle, color: "text-red-400 bg-red-500/10", label: "Aviso" },
};

export default function NotificationsPage() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();

  const markReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("Todas as notificações marcadas como lidas");
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Agora mesmo";
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <ClientAdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Bell className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Notificações</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {unreadCount > 0
                ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                : "Todas as notificações foram lidas"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !notifications?.length ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-zinc-800 mb-4">
              <BellOff className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-100 mb-1">Nenhuma notificação</h3>
            <p className="text-sm text-zinc-400">Você receberá avisos sobre pagamentos e atualizações aqui</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const config = TYPE_CONFIG[notif.type || "info"] || TYPE_CONFIG.info;
            const TypeIcon = config.icon;

            return (
              <Card
                key={notif.id}
                className={`bg-zinc-900 border-zinc-800 transition-all cursor-pointer hover:bg-zinc-800/70 ${
                  !notif.isRead ? "border-l-2 border-l-amber-500" : "opacity-70"
                }`}
                onClick={() => {
                  if (!notif.isRead) {
                    markReadMutation.mutate({ id: notif.id });
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium text-sm ${!notif.isRead ? "text-white" : "text-zinc-400"}`}>
                          {notif.title}
                        </h3>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color} border-current/20`}>
                          {config.label}
                        </Badge>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${!notif.isRead ? "text-zinc-300" : "text-zinc-500"}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="h-3 w-3 text-zinc-600" />
                        <span className="text-xs text-zinc-600">{formatDate(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </ClientAdminLayout>
  );
}
