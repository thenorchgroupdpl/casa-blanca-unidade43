/**
 * Admin Redirect Page
 * Redirects to the appropriate admin dashboard based on user role
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function AdminRedirect() {
  const [, setLocation] = useLocation();
  
  // Check authentication status
  const { data: authData, isLoading } = trpc.emailAuth.check.useQuery();

  useEffect(() => {
    if (isLoading) return;

    if (!authData?.authenticated || !authData.user) {
      // Not logged in, redirect to login
      setLocation("/login");
      return;
    }

    // Redirect based on role and tenant
    const role = authData.user.role;
    const tenantId = authData.user.tenantId;
    
    if (role === "super_admin") {
      setLocation("/admin/super");
    } else if (role === "client_admin" || role === "admin") {
      setLocation("/admin/dashboard");
    } else if (tenantId) {
      // Funcionário com loja vinculada -> painel da loja
      setLocation("/admin/dashboard");
    } else {
      // Regular user without tenant, redirect to home
      setLocation("/");
    }
  }, [authData, isLoading, setLocation]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
        <p className="text-white font-serif text-xl">Redirecionando...</p>
        <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
      </div>
    </div>
  );
}
