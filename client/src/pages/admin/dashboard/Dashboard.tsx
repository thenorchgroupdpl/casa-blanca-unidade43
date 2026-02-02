import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, LayoutGrid, Store, TrendingUp } from "lucide-react";

export default function ClientDashboard() {
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();
  const { data: products, isLoading: loadingProducts } = trpc.products.list.useQuery();
  const { data: settings, isLoading: loadingSettings } = trpc.store.getSettings.useQuery();

  const isLoading = loadingCategories || loadingProducts || loadingSettings;

  const stats = [
    {
      title: "Categorias",
      value: categories?.length ?? 0,
      icon: LayoutGrid,
      description: "Categorias ativas",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Produtos",
      value: products?.length ?? 0,
      icon: Package,
      description: "Produtos cadastrados",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Disponíveis",
      value: products?.filter(p => p.isAvailable).length ?? 0,
      icon: TrendingUp,
      description: "Produtos à venda",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Status",
      value: settings?.whatsapp ? "Configurado" : "Pendente",
      icon: Store,
      description: "Dados da loja",
      color: settings?.whatsapp ? "text-green-500" : "text-orange-500",
      bgColor: settings?.whatsapp ? "bg-green-500/10" : "bg-orange-500/10",
    },
  ];

  return (
    <ClientAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Visão geral da sua loja
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

        {/* Quick Actions */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
            <CardDescription className="text-zinc-400">
              Gerencie sua loja de forma rápida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/admin/dashboard/catalog"
                className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center gap-4"
              >
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-white">Catálogo</p>
                  <p className="text-sm text-zinc-500">Gerenciar produtos</p>
                </div>
              </a>
              
              <a
                href="/admin/dashboard/vitrine"
                className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center gap-4"
              >
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <LayoutGrid className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-white">Vitrine</p>
                  <p className="text-sm text-zinc-500">Configurar home</p>
                </div>
              </a>
              
              <a
                href="/admin/dashboard/store"
                className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center gap-4"
              >
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Store className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-white">Dados da Loja</p>
                  <p className="text-sm text-zinc-500">Horários e contato</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Produtos Recentes</CardTitle>
            <CardDescription className="text-zinc-400">
              Últimos produtos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-zinc-500">Carregando...</div>
            ) : products && products.length > 0 ? (
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <Package className="h-5 w-5 text-zinc-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-zinc-500">
                          R$ {Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {product.isAvailable ? "Disponível" : "Indisponível"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Nenhum produto cadastrado ainda</p>
                <p className="text-sm text-zinc-600 mt-1">
                  Vá em "Catálogo" para adicionar produtos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientAdminLayout>
  );
}
