import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Users, Search, Building2, Trash2, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  user: "Usuário",
  admin: "Admin",
  super_admin: "Super Admin",
  client_admin: "Lojista",
};

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-amber-500/20 text-amber-400",
  client_admin: "bg-blue-500/20 text-blue-400",
  admin: "bg-purple-500/20 text-purple-400",
  user: "bg-zinc-700 text-zinc-400",
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<{ id: number; role: string; tenantId: number | null } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: usersList, isLoading } = trpc.users.list.useQuery();
  const { data: tenants } = trpc.tenants.list.useQuery();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Papel do usuário atualizado!");
      utils.users.list.invalidate();
      setEditingUser(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído!");
      utils.users.list.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const filteredUsers = usersList?.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      roleLabels[u.role]?.toLowerCase().includes(q)
    );
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuários</h1>
          <p className="text-zinc-400 mt-1">Gerencie todos os usuários da plataforma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-sm text-zinc-400">Total</p>
              <p className="text-2xl font-bold text-white">{usersList?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-sm text-zinc-400">Super Admins</p>
              <p className="text-2xl font-bold text-amber-500">
                {usersList?.filter(u => u.role === 'super_admin').length || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-sm text-zinc-400">Lojistas</p>
              <p className="text-2xl font-bold text-blue-400">
                {usersList?.filter(u => u.role === 'client_admin').length || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-sm text-zinc-400">Usuários</p>
              <p className="text-2xl font-bold text-zinc-300">
                {usersList?.filter(u => u.role === 'user').length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, email ou papel..."
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>

        {/* Users Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-500">Carregando...</div>
            ) : !filteredUsers?.length ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Nome</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Papel</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Loja</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Login</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Último Acesso</th>
                      <th className="text-right p-4 text-sm font-medium text-zinc-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300">
                              {user.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="text-white font-medium">{user.name || "—"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-400 text-sm">{user.email || "—"}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadgeColors[user.role] || roleBadgeColors.user}`}>
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400 text-sm">
                          {user.tenantName ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {user.tenantName}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-4 text-zinc-500 text-sm capitalize">{user.loginMethod || "—"}</td>
                        <td className="p-4 text-zinc-500 text-sm">
                          {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString('pt-BR') : "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-white"
                              onClick={() => setEditingUser({
                                id: user.id,
                                role: user.role,
                                tenantId: user.tenantId,
                              })}
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-red-400"
                              onClick={() => setDeleteConfirmId(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Alterar Papel do Usuário</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Defina o papel e a loja associada ao usuário.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Papel</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client_admin">Lojista</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingUser.role === 'client_admin' && (
                <div className="space-y-2">
                  <Label className="text-white">Loja Associada</Label>
                  <Select
                    value={editingUser.tenantId?.toString() || "none"}
                    onValueChange={(value) => setEditingUser({
                      ...editingUser,
                      tenantId: value === "none" ? null : parseInt(value),
                    })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {tenants?.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} className="border-zinc-700 text-zinc-300">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!editingUser) return;
                updateRoleMutation.mutate({
                  userId: editingUser.id,
                  role: editingUser.role as any,
                  tenantId: editingUser.tenantId,
                });
              }}
              disabled={updateRoleMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {updateRoleMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Usuário</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="border-zinc-700 text-zinc-300">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate({ id: deleteConfirmId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
