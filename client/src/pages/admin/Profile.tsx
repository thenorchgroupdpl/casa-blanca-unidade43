import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, Loader2, Save, Shield, Trash2, User, Mail, Building2, BadgeCheck } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
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

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

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

  const roleBadgeColors: Record<string, string> = {
    super_admin: "bg-red-500/20 text-red-400 border-red-500/30",
    admin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    client_admin: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    user: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };

  // Determine back route based on user role
  const getBackRoute = () => {
    if (roleData?.role === "super_admin" || roleData?.role === "admin") {
      return "/admin/super";
    }
    return "/admin/dashboard";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(getBackRoute())}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
            <p className="text-zinc-500 text-sm">Gerencie suas informações pessoais</p>
          </div>
        </div>

        {/* Avatar Card */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Camera className="h-4 w-4 text-amber-500" />
              Foto de Perfil
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Sua foto será exibida no menu lateral e no header do painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-zinc-700/50 ring-2 ring-zinc-800">
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
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-amber-500" />
              Informações Pessoais
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Atualize seu nome de exibição e veja suas informações de conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name - Editable */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Nome
              </Label>
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <Button
                  onClick={handleSaveName}
                  disabled={updateMutation.isPending || name === roleData?.name}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-4"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Email - Read Only */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                value={roleData?.email || ""}
                disabled
                className="bg-zinc-800/30 border-zinc-700/30 text-zinc-500 cursor-not-allowed"
              />
            </div>

            {/* Role - Read Only with Badge */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Cargo
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  value={roleLabels[roleData?.role || "user"] || roleData?.role || ""}
                  disabled
                  className="bg-zinc-800/30 border-zinc-700/30 text-zinc-500 cursor-not-allowed flex-1"
                />
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleBadgeColors[roleData?.role || "user"]}`}>
                  {roleLabels[roleData?.role || "user"] || roleData?.role}
                </span>
              </div>
            </div>

            {/* Tenant - Read Only */}
            {roleData?.tenantName && (
              <div className="space-y-2">
                <Label className="text-zinc-400 text-sm flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Loja
                </Label>
                <Input
                  value={roleData.tenantName}
                  disabled
                  className="bg-zinc-800/30 border-zinc-700/30 text-zinc-500 cursor-not-allowed"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
