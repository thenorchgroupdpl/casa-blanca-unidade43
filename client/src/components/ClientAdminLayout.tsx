import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LogOut, 
  PanelLeft, 
  LayoutDashboard,
  Package,
  LayoutGrid,
  Store,
  ExternalLink,
  ArrowLeft,
  User
} from "lucide-react";
import { toast } from "sonner";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Package, label: "Catálogo", path: "/admin/dashboard/catalog" },
  { icon: LayoutGrid, label: "Vitrine", path: "/admin/dashboard/vitrine" },
  { icon: Store, label: "Dados da Loja", path: "/admin/dashboard/store" },
];

const SIDEBAR_WIDTH_KEY = "client-admin-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function ClientAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const { data: roleData, isLoading: roleLoading } = trpc.auth.getRole.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading || roleLoading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold text-white">Casa Blanca</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-center text-white">
              Painel do Lojista
            </h1>
            <p className="text-sm text-zinc-400 text-center max-w-sm">
              Faça login para gerenciar sua loja.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = '/login';
            }}
            size="lg"
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has access (client_admin or super_admin with tenantId)
  const hasAccess = roleData?.role === 'client_admin' || 
    ((roleData?.role === 'super_admin' || roleData?.role === 'admin') && roleData?.tenantId);

  if (!hasAccess) {
    // If super_admin without tenantId, redirect to super admin panel
    if (roleData?.role === 'super_admin' || roleData?.role === 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-950">
          <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Store className="h-8 w-8 text-amber-500" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-center text-white">
                Selecione uma Loja
              </h1>
              <p className="text-sm text-zinc-400 text-center max-w-sm">
                Como Super Admin, você precisa acessar o painel de uma loja específica para gerenciar seu catálogo.
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/admin/super/tenants'}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              Ir para Gestão de Lojas
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <Store className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-center text-white">
              Acesso Negado
            </h1>
            <p className="text-sm text-zinc-400 text-center max-w-sm">
              Você não tem permissão para acessar o Painel do Lojista.
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full border-zinc-700 text-white hover:bg-zinc-800"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
      className="!bg-zinc-950"
    >
      <ClientAdminLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </ClientAdminLayoutContent>
    </SidebarProvider>
  );
}

type ClientAdminLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function ClientAdminLayoutContent({
  children,
  setSidebarWidth,
}: ClientAdminLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const { data: roleData } = trpc.auth.getRole.useQuery();
  const utils = trpc.useUtils();

  // Mutation para liberar tenant (Super Admin volta ao modo sem tenant)
  const releaseTenantMutation = trpc.tenants.releaseTenant.useMutation({
    onSuccess: () => {
      toast.success("Você saiu do modo de gestão da loja");
      utils.auth.getRole.invalidate();
      setLocation('/admin/super/tenants');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const handleReleaseTenant = () => {
    releaseTenantMutation.mutate();
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0A] overflow-x-hidden">
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-zinc-800 bg-zinc-900"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-zinc-800">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-zinc-400" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Store className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="font-semibold tracking-tight truncate text-white">
                    Minha Loja
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-zinc-900">
            <SidebarMenu className="px-2 py-3">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal ${
                        isActive 
                          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-amber-500" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-zinc-800 bg-zinc-900">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-zinc-800 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                  <Avatar className="h-9 w-9 border border-zinc-700 shrink-0">
                    {roleData?.avatarUrl && <AvatarImage src={roleData.avatarUrl} alt="Avatar" />}
                    <AvatarFallback className="text-xs font-medium bg-amber-500/20 text-amber-500">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-white">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate mt-1.5">
                      {roleData?.tenantName || "Lojista"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                <DropdownMenuItem
                  onClick={() => setLocation('/admin/profile')}
                  className="cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-800"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={() => {
                    const slug = roleData?.tenantSlug;
                    window.open(slug ? `/${slug}` : '/', '_blank');
                  }}
                  className="cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-800"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Ver Loja</span>
                </DropdownMenuItem>
                {(roleData?.role === 'super_admin' || roleData?.role === 'admin') && roleData?.tenantId && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      onClick={handleReleaseTenant}
                      disabled={releaseTenantMutation.isPending}
                      className="cursor-pointer text-amber-400 focus:text-amber-400 focus:bg-amber-500/10"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <span>Sair da Loja</span>
                    </DropdownMenuItem>
                  </>
                )}
                {(roleData?.role === 'super_admin' || roleData?.role === 'admin') && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      onClick={() => setLocation('/admin/super')}
                      className="cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-800"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Super Admin</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-500/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="!bg-[#0A0A0A] flex-1 w-full min-w-0">
        {isMobile && (
          <div className="flex border-b border-zinc-800 h-14 items-center justify-between bg-zinc-900/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-zinc-800 text-white" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-white">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 overflow-auto bg-[#0A0A0A] min-h-screen w-full">{children}</main>
      </SidebarInset>
    </div>
  );
}
