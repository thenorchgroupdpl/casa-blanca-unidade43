/**
 * useCouponValidation - Hook compartilhado para validação de cupons
 * 
 * Centraliza toda a lógica de cupom (validação, aplicação, remoção, incremento de uso)
 * para ser reutilizado em CartDrawer e CartPopup sem duplicação de código.
 * 
 * Mensagens de erro específicas vindas do backend:
 * - "Cupom inválido ou inativo." (não existe ou is_active = false)
 * - "Este cupom está expirado." (data atual > expires_at)
 * - "O limite de usos para este cupom já foi atingido." (usage_count >= usage_limit)
 */

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export interface AppliedCoupon {
  id: number;
  code: string;
  discountPercentage: number;
}

interface UseCouponValidationOptions {
  tenantId: number | null;
}

interface UseCouponValidationReturn {
  // State
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: AppliedCoupon | null;
  couponError: string;
  isValidating: boolean;

  // Actions
  handleApply: () => Promise<void>;
  handleRemove: () => void;
  handleIncrementUsage: () => Promise<void>;
  resetCoupon: () => void;

  // Computed
  calculateDiscount: (subtotal: number) => number;
}

export function useCouponValidation({ tenantId }: UseCouponValidationOptions): UseCouponValidationReturn {
  const [couponCode, setCouponCodeRaw] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // tRPC hooks
  const validateQuery = trpc.coupons.validate.useQuery(
    { tenantId: tenantId!, code: couponCode.trim().toUpperCase() },
    { enabled: false }
  );

  const incrementUsageMutation = trpc.coupons.incrementUsage.useMutation();

  // Force uppercase on set
  const setCouponCode = useCallback((code: string) => {
    setCouponCodeRaw(code.toUpperCase());
    setCouponError('');
  }, []);

  // Validate and apply coupon
  const handleApply = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }
    if (!tenantId) return;

    setIsValidating(true);
    setCouponError('');

    try {
      const result = await validateQuery.refetch();
      if (result.data?.valid && result.data.coupon) {
        setAppliedCoupon({
          id: result.data.coupon.id,
          code: result.data.coupon.code,
          discountPercentage: result.data.coupon.discountPercentage,
        });
        setCouponError('');
      } else {
        // Backend returns specific error messages:
        // "Cupom inválido ou inativo."
        // "Este cupom está expirado."
        // "O limite de usos para este cupom já foi atingido."
        setCouponError(result.data?.reason || 'Cupom inválido ou inativo.');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Erro ao validar cupom. Tente novamente.');
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  }, [couponCode, tenantId, validateQuery]);

  // Remove applied coupon
  const handleRemove = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCodeRaw('');
    setCouponError('');
  }, []);

  // Increment usage count after successful order (Regra de Ouro)
  const handleIncrementUsage = useCallback(async () => {
    if (!appliedCoupon) return;
    try {
      await incrementUsageMutation.mutateAsync({ couponId: appliedCoupon.id });
    } catch {
      // Non-critical: don't block checkout if usage increment fails
      console.warn('[Coupon] Failed to increment usage count');
    }
  }, [appliedCoupon, incrementUsageMutation]);

  // Full reset (after checkout)
  const resetCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCodeRaw('');
    setCouponError('');
  }, []);

  // Calculate discount amount for a given subtotal
  const calculateDiscount = useCallback((subtotal: number): number => {
    if (!appliedCoupon) return 0;
    return subtotal * (appliedCoupon.discountPercentage / 100);
  }, [appliedCoupon]);

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    isValidating,
    handleApply,
    handleRemove,
    handleIncrementUsage,
    resetCoupon,
    calculateDiscount,
  };
}
