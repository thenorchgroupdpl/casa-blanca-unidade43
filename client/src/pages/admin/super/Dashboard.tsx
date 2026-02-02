import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, Users, ShoppingBag, TrendingUp } from "lucide-react";

export default function SuperAdminDashboard() {
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();

  const stats = [
    {
      title: "Total de Clientes",
      value: tenants?.length ?? 0,
      icon: Building2,
      description: "Lojas cadastradas",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Clientes Ativos",
      value: tenants?.filter(t => t.isActive).length ?? 0,
      icon: TrendingUp,
      description: "Em operação",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "APIs Configuradas",
      value: tenants?.filter(t => t.googleApiKey).length ?? 0,
      icon: ShoppingBag,
      description: "Com Google integrado",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Usuários",
      value: "-",
      icon: Users,
      description: "Total de usuários",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Visão geral da plataforma Casa Blanca
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Tenants */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Clientes Recentes</CardTitle>
            <CardDescription className="text-zinc-400">
              Últimas lojas cadastradas na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-zinc-500">Carregando...</div>
            ) : tenants && tenants.length > 0 ? (
              <div className="space-y-4">
                {tenants.slice(0, 5).map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{tenant.name}</p>
                        <p className="text-sm text-zinc-500">/{tenant.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tenant.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {tenant.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Nenhum cliente cadastrado ainda</p>
                <p className="text-sm text-zinc-600 mt-1">
                  Clique em "Clientes" no menu para adicionar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
