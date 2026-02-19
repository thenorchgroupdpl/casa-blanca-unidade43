import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Key, 
  Palette,
  ExternalLink,
  Search,
  Store
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type TenantFormData = {
  name: string;
  slug: string;
  googleApiKey: string;
  googlePlaceId: string;
  themeColors: {
    primary: string;
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
  fontFamily: string;
  fontDisplay: string;
  borderRadius: string;
  isActive: boolean;
};

const defaultFormData: TenantFormData = {
  name: "",
  slug: "",
  googleApiKey: "",
  googlePlaceId: "",
  themeColors: {
    primary: "#D4AF37",
    background: "#121212",
    foreground: "#FFFFFF",
    accent: "#1a1a1a",
    muted: "#a1a1aa",
  },
  fontFamily: "DM Sans",
  fontDisplay: "DM Serif Display",
  borderRadius: "0.75rem",
  isActive: true,
};

export default function TenantsPage() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<number | null>(null);
  const [formData, setFormData] = useState<TenantFormData>(defaultFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: tenants, isLoading } = trpc.tenants.list.useQuery();

  const createMutation = trpc.tenants.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      utils.tenants.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.tenants.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      utils.tenants.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.tenants.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente excluído com sucesso!");
      utils.tenants.list.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const assumeTenantMutation = trpc.tenants.assumeTenant.useMutation({
    onSuccess: () => {
      toast.success("Você agora está gerenciando esta loja!");
      utils.auth.getRole.invalidate();
      setLocation('/admin/dashboard');
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const handleAssumeTenant = (tenantId: number) => {
    assumeTenantMutation.mutate({ tenantId });
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingTenant(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tenant: typeof tenants extends (infer T)[] | undefined ? T : never) => {
    if (!tenant) return;
    setEditingTenant(tenant.id);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      googleApiKey: tenant.googleApiKey || "",
      googlePlaceId: tenant.googlePlaceId || "",
      themeColors: tenant.themeColors || defaultFormData.themeColors,
      fontFamily: tenant.fontFamily || "DM Sans",
      fontDisplay: tenant.fontDisplay || "DM Serif Display",
      borderRadius: tenant.borderRadius || "0.75rem",
      isActive: tenant.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingTenant) {
      updateMutation.mutate({
        id: editingTenant,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const filteredTenants = tenants?.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Clientes</h1>
            <p className="text-zinc-400 mt-1">
              Gerencie as lojas cadastradas na plataforma
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        {/* Tenants List */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Lista de Clientes</CardTitle>
            <CardDescription className="text-zinc-400">
              {filteredTenants?.length ?? 0} cliente(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-zinc-500 text-center py-8">Carregando...</div>
            ) : filteredTenants && filteredTenants.length > 0 ? (
              <div className="space-y-3">
                {filteredTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ 
                          backgroundColor: tenant.themeColors?.primary 
                            ? `${tenant.themeColors.primary}20` 
                            : 'rgba(212, 175, 55, 0.2)' 
                        }}
                      >
                        <Building2 
                          className="h-6 w-6" 
                          style={{ 
                            color: tenant.themeColors?.primary || '#D4AF37' 
                          }} 
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tenant.name}</p>
                        <p className="text-sm text-zinc-500">/{tenant.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tenant.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {tenant.isActive ? "Ativo" : "Inativo"}
                      </span>
                      
                      {/* API Badge */}
                      {tenant.googleApiKey && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          API
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5"
                          onClick={() => handleAssumeTenant(tenant.id)}
                          disabled={assumeTenantMutation.isPending}
                        >
                          <Store className="h-4 w-4" />
                          <span className="text-xs font-medium">Gerenciar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                          onClick={() => window.open(`/${tenant.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10"
                          onClick={() => openEditDialog(tenant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => setDeleteConfirmId(tenant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg">Nenhum cliente encontrado</p>
                <p className="text-sm text-zinc-600 mt-2">
                  Clique em "Novo Cliente" para adicionar o primeiro
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTenant ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingTenant
                  ? "Atualize as informações do cliente"
                  : "Preencha os dados para criar um novo cliente"}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="bg-zinc-800 border-zinc-700">
                <TabsTrigger value="basic" className="data-[state=active]:bg-zinc-700">
                  Básico
                </TabsTrigger>
                <TabsTrigger value="integrations" className="data-[state=active]:bg-zinc-700">
                  <Key className="h-4 w-4 mr-2" />
                  Integrações
                </TabsTrigger>
                <TabsTrigger value="design" className="data-[state=active]:bg-zinc-700">
                  <Palette className="h-4 w-4 mr-2" />
                  Design
                </TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome da Loja</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: editingTenant ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Ex: Casa Blanca"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">/</span>
                    <Input
                      value={formData.slug}
                      onChange={(e) => {
                        // Sanitize: only allow lowercase letters, numbers and hyphens
                        const sanitized = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-/, "");
                        setFormData({ ...formData, slug: sanitized });
                      }}
                      placeholder="casa-blanca"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    URL de acesso: /{formData.slug || "slug"} (apenas letras minúsculas, números e hífens)
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm text-zinc-500">
                      {formData.isActive ? "Loja ativa e visível" : "Loja desativada"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </TabsContent>

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-400">
                    ⚠️ Estas configurações são sensíveis e só podem ser editadas pelo Super Admin.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Google Places API Key</Label>
                  <Input
                    type="password"
                    value={formData.googleApiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, googleApiKey: e.target.value })
                    }
                    placeholder="AIza..."
                    className="bg-zinc-800 border-zinc-700 font-mono"
                  />
                  <p className="text-xs text-zinc-500">
                    Chave da API do Google para mapas e avaliações
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Google Place ID</Label>
                  <Input
                    value={formData.googlePlaceId}
                    onChange={(e) =>
                      setFormData({ ...formData, googlePlaceId: e.target.value })
                    }
                    placeholder="ChIJ..."
                    className="bg-zinc-800 border-zinc-700 font-mono"
                  />
                  <p className="text-xs text-zinc-500">
                    ID do estabelecimento no Google Maps para buscar avaliações
                  </p>
                </div>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.themeColors.primary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            themeColors: {
                              ...formData.themeColors,
                              primary: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.themeColors.primary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            themeColors: {
                              ...formData.themeColors,
                              primary: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor de Fundo</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.themeColors.background}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            themeColors: {
                              ...formData.themeColors,
                              background: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={formData.themeColors.background}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            themeColors: {
                              ...formData.themeColors,
                              background: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fonte Principal</Label>
                  <Input
                    value={formData.fontFamily}
                    onChange={(e) =>
                      setFormData({ ...formData, fontFamily: e.target.value })
                    }
                    placeholder="DM Sans"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fonte Display (Títulos)</Label>
                  <Input
                    value={formData.fontDisplay}
                    onChange={(e) =>
                      setFormData({ ...formData, fontDisplay: e.target.value })
                    }
                    placeholder="DM Serif Display"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Arredondamento de Bordas</Label>
                  <Input
                    value={formData.borderRadius}
                    onChange={(e) =>
                      setFormData({ ...formData, borderRadius: e.target.value })
                    }
                    placeholder="0.75rem"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: formData.themeColors.background }}>
                  <p className="text-sm text-zinc-500 mb-2">Preview:</p>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ 
                      backgroundColor: formData.themeColors.accent,
                      borderRadius: formData.borderRadius,
                    }}
                  >
                    <h3 
                      className="text-lg font-bold"
                      style={{ 
                        color: formData.themeColors.foreground,
                        fontFamily: formData.fontDisplay,
                      }}
                    >
                      {formData.name || "Nome da Loja"}
                    </h3>
                    <p 
                      style={{ 
                        color: formData.themeColors.muted,
                        fontFamily: formData.fontFamily,
                      }}
                    >
                      Texto de exemplo
                    </p>
                    <button
                      className="mt-3 px-4 py-2 rounded-lg font-medium"
                      style={{ 
                        backgroundColor: formData.themeColors.primary,
                        color: formData.themeColors.background,
                        borderRadius: formData.borderRadius,
                      }}
                    >
                      Botão de Ação
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : editingTenant
                  ? "Salvar Alterações"
                  : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
