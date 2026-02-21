import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2, LogIn, AlertCircle, HelpCircle, MessageCircle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const utils = trpc.useUtils();

  const loginMutation = trpc.emailAuth.login.useMutation({
    onSuccess: (data) => {
      utils.emailAuth.check.invalidate();
      utils.auth.me.invalidate();

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
      setHasAttempted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setHasAttempted(false);

    if (!email || !password) {
      setError("Preencha todos os campos");
      setHasAttempted(true);
      return;
    }

    loginMutation.mutate({ email, password, rememberMe });
  };

  // Determine input border classes based on state
  const getInputClasses = (fieldHasValue: boolean) => {
    const base =
      "bg-[#1a1a1a]/80 border text-white placeholder:text-gray-600 transition-all duration-200 h-11";
    if (hasAttempted && error) {
      return `${base} border-red-500/70 focus:border-red-400 focus:ring-red-400/30 focus:ring-2`;
    }
    return `${base} border-[#2a2a2a] focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 focus:ring-2`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium dark background with subtle gradient and noise */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1a1510]/40 rounded-full blur-[150px]" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo area */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif tracking-wide">
            <span className="text-white/90">Casa</span>
            <span className="text-[#D4AF37]"> Blanca</span>
          </h1>
          <div className="mt-2 w-12 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mx-auto" />
        </div>

        <Card className="bg-[#111111]/90 border-[#1f1f1f] backdrop-blur-xl shadow-2xl shadow-black/40">
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-lg text-white/90 font-medium">
              Entrar no Painel
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm">
              Acesse sua conta para gerenciar sua loja
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 pb-6 px-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error alert */}
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-500/[0.08] border-red-500/20 py-3"
                >
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400 text-sm font-normal">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (hasAttempted) {
                      setHasAttempted(false);
                      setError("");
                    }
                  }}
                  className={getInputClasses(!!email)}
                  disabled={loginMutation.isPending}
                  autoComplete="email"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-400 text-sm font-normal">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (hasAttempted) {
                        setHasAttempted(false);
                        setError("");
                      }
                    }}
                    className={`${getInputClasses(!!password)} pr-10`}
                    disabled={loginMutation.isPending}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                    className="border-[#3a3a3a] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] data-[state=checked]:text-black"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-gray-500 text-xs font-normal cursor-pointer select-none"
                  >
                    Lembrar-me
                  </Label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#c9a432] text-black font-semibold h-11 transition-all duration-200 disabled:opacity-60"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Plataforma de gestão Casa Blanca &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="bg-[#151515] border-[#252525] text-white max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-2">
              <ShieldAlert className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <DialogTitle className="text-center text-white text-lg">
              Redefinição de Senha
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400 text-sm leading-relaxed pt-2">
              Para redefinir sua senha, por favor entre em contato com o
              administrador ou suporte da plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {/* WhatsApp contact option */}
            <a
              href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20preciso%20redefinir%20minha%20senha%20de%20acesso%20ao%20painel%20Casa%20Blanca."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#252525] hover:border-[#2f6b2f] hover:bg-[#1a2a1a] transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
              </div>
              <div>
                <p className="text-sm text-white font-medium group-hover:text-[#25D366] transition-colors">
                  Contato via WhatsApp
                </p>
                <p className="text-xs text-gray-500">
                  Fale com o suporte para recuperar seu acesso
                </p>
              </div>
            </a>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#D4AF37]/[0.05] border border-[#D4AF37]/10">
              <HelpCircle className="h-4 w-4 text-[#D4AF37]/60 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Por segurança, a redefinição de senha é feita exclusivamente
                pelo administrador do sistema. Informe seu e-mail de cadastro
                ao entrar em contato.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setShowForgotModal(false)}
              variant="outline"
              className="w-full border-[#252525] text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
