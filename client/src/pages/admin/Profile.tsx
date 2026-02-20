import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Camera, Loader2, Save, Trash2, User } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: roleData, isLoading } = trpc.auth.getRole.useQuery(undefined, {
    enabled: !!user,
  });
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roleData) {
      setName(roleData.name || "");
      setAvatarPreview(roleData.avatarUrl || null);
    }
  }, [roleData]);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.auth.getRole.invalidate();
      toast.success("Nome atualizado com sucesso!");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const uploadAvatarMutation = trpc.profile.uploadAvatar.useMutation({
    onSuccess: (data) => {
      setAvatarPreview(data.url);
      utils.auth.getRole.invalidate();
      toast.success("Avatar atualizado com sucesso!");
    },
    onError: (err) => toast.error(`Erro ao enviar avatar: ${err.message}`),
  });

  const removeAvatarMutation = trpc.profile.removeAvatar.useMutation({
    onSuccess: () => {
      setAvatarPreview(null);
      utils.auth.getRole.invalidate();
      toast.success("Avatar removido!");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Read as base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setAvatarPreview(reader.result as string);
      uploadAvatarMutation.mutate({
        imageData: base64,
        fileName: file.name,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }
    updateMutation.mutate({ name: name.trim() });
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Administrador",
    client_admin: "Lojista",
    user: "Usuário",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
        <p className="text-zinc-400 mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Foto de Perfil</CardTitle>
          <CardDescription className="text-zinc-400">
            Sua foto será exibida no menu lateral e no header do painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-zinc-700">
                <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-2xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isPending}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                {uploadAvatarMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                Alterar Foto
              </Button>
              {avatarPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAvatarMutation.mutate()}
                  disabled={removeAvatarMutation.isPending}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Informações Pessoais</CardTitle>
          <CardDescription className="text-zinc-400">
            Atualize seu nome de exibição.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Nome</Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                onClick={handleSaveName}
                disabled={updateMutation.isPending || name === roleData?.name}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Email</Label>
            <Input
              value={roleData?.email || ""}
              disabled
              className="bg-zinc-800/50 border-zinc-700 text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Cargo</Label>
            <Input
              value={roleLabels[roleData?.role || "user"] || roleData?.role || ""}
              disabled
              className="bg-zinc-800/50 border-zinc-700 text-zinc-500"
            />
          </div>

          {roleData?.tenantName && (
            <div className="space-y-2">
              <Label className="text-zinc-300">Loja</Label>
              <Input
                value={roleData.tenantName}
                disabled
                className="bg-zinc-800/50 border-zinc-700 text-zinc-500"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
