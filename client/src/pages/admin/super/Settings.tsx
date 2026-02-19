import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Bell, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-zinc-400 mt-1">Configurações gerais da plataforma Casa Blanca</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* General */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-amber-500" />
                Geral
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Configurações gerais da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <p className="text-sm font-medium text-white">Nome da Plataforma</p>
                <p className="text-sm text-zinc-400 mt-1">Casa Blanca</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <p className="text-sm font-medium text-white">Versão</p>
                <p className="text-sm text-zinc-400 mt-1">1.0.0</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <p className="text-sm font-medium text-white">Ambiente</p>
                <p className="text-sm text-zinc-400 mt-1">Produção</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Notificações
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Configurações de notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Em breve</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Configurações de notificações por email e push
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Segurança
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Configurações de segurança e acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Shield className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Em breve</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Políticas de senha, 2FA e logs de acesso
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                Banco de Dados
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Informações do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Database className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Em breve</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Backup, migração e estatísticas do banco
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
