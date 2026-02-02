import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const utils = trpc.useUtils();

  const loginMutation = trpc.emailAuth.login.useMutation({
    onSuccess: (data) => {
      // Invalidate auth cache
      utils.emailAuth.check.invalidate();
      utils.auth.me.invalidate();
      
      // Redirect based on role
      if (data.user.role === "super_admin") {
        setLocation("/admin/super");
      } else if (data.user.role === "client_admin" || data.user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/");
      }
    },
    onError: (err) => {
      setError(err.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a2a] relative z-10">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="mx-auto">
            <h1 className="text-3xl font-serif">
              <span className="text-white">Casa</span>
              <span className="text-[#D4AF37]"> Blanca</span>
            </h1>
          </div>
          
          <div>
            <CardTitle className="text-xl text-white">Entrar no Painel</CardTitle>
            <CardDescription className="text-gray-400">
              Acesse sua conta para gerenciar sua loja
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37] pr-10"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#D4AF37] hover:bg-[#c9a432] text-black font-semibold"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
            <p className="text-sm text-gray-400 font-medium mb-2">Credenciais de Teste:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Super Admin:</span>
                <span className="text-gray-300 font-mono">admin@casablanca.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lojista:</span>
                <span className="text-gray-300 font-mono">lojista@casablanca.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Senha:</span>
                <span className="text-gray-300 font-mono">123456</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
