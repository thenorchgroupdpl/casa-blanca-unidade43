/**
 * Delivery Zones Page - Logística
 * Gestão de zonas de entrega e taxas dinâmicas
 * Dark mode, warm luxury theme
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Store,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface ZoneFormData {
  zoneName: string;
  feeAmount: string;
  isPickup: boolean;
}

const defaultZoneForm: ZoneFormData = {
  zoneName: "",
  feeAmount: "0.00",
  isPickup: false,
};

// ============================================
// COMPONENT
// ============================================

export default function DeliveryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ZoneFormData>(defaultZoneForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: zones, isLoading } = trpc.deliveryZones.list.useQuery();

  const createZone = trpc.deliveryZones.create.useMutation({
    onSuccess: () => {
      toast.success("Zona de entrega criada!");
      utils.deliveryZones.list.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateZone = trpc.deliveryZones.update.useMutation({
    onSuccess: () => {
      toast.success("Zona atualizada!");
      utils.deliveryZones.list.invalidate();
      closeDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteZone = trpc.deliveryZones.delete.useMutation({
    onSuccess: () => {
      toast.success("Zona excluída!");
      utils.deliveryZones.list.invalidate();
      setDeleteId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(defaultZoneForm);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultZoneForm);
    setDialogOpen(true);
  };

  const openEdit = (zone: any) => {
    setEditingId(zone.id);
    setForm({
      zoneName: zone.zoneName,
      feeAmount: zone.feeAmount || "0.00",
      isPickup: zone.isPickup || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.zoneName.trim()) {
      toast.error("Nome da zona é obrigatório");
      return;
    }

    const fee = parseFloat(form.feeAmount);
    if (isNaN(fee) || fee < 0) {
      toast.error("Taxa deve ser um valor válido (>= 0)");
      return;
    }

    if (editingId) {
      updateZone.mutate({
        id: editingId,
        data: {
          zoneName: form.zoneName.trim(),
          feeAmount: form.isPickup ? "0.00" : fee.toFixed(2),
          isPickup: form.isPickup,
        },
      });
    } else {
      createZone.mutate({
        zoneName: form.zoneName.trim(),
        feeAmount: form.isPickup ? "0.00" : fee.toFixed(2),
        isPickup: form.isPickup,
      });
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <ClientAdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Entregas</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Configure zonas de entrega e taxas para sua loja
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Zona
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-amber-500/10 border border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Como funciona?</p>
              <p className="text-xs text-amber-300/70 mt-1">
                Crie zonas de entrega (bairros, regiões) com taxas diferentes. O cliente
                escolhe a zona no checkout e a taxa é adicionada automaticamente ao pedido.
                Você também pode criar uma zona de "Retirada no Local" com taxa zero.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zones List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : !zones || zones.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              Nenhuma zona de entrega
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              Crie zonas para definir taxas de entrega por região.
            </p>
            <Button
              onClick={openCreate}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Zona
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {zones.map((zone: any) => (
            <Card key={zone.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${zone.isPickup ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                      {zone.isPickup ? (
                        <Store className="w-5 h-5 text-green-400" />
                      ) : (
                        <Truck className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{zone.zoneName}</h3>
                        {zone.isPickup && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Retirada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mt-0.5">
                        {zone.isPickup ? (
                          "Sem taxa — cliente retira no local"
                        ) : (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Taxa: R$ {parseFloat(zone.feeAmount || "0").toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(zone)}
                      className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white h-9 w-9"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(zone.id)}
                      className="border-zinc-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={() => closeDialog()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Editar Zona" : "Nova Zona de Entrega"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Pickup Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
              <div>
                <Label>Retirada no Local</Label>
                <p className="text-sm text-zinc-500">
                  {form.isPickup
                    ? "Cliente retira no local (taxa zero)"
                    : "Entrega com taxa configurável"}
                </p>
              </div>
              <Switch
                checked={form.isPickup}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isPickup: checked, feeAmount: checked ? "0.00" : form.feeAmount })
                }
              />
            </div>

            {/* Zone Name */}
            <div className="space-y-2">
              <Label>
                {form.isPickup ? "Nome do Ponto de Retirada" : "Nome da Zona / Bairro"}
              </Label>
              <Input
                value={form.zoneName}
                onChange={(e) => setForm({ ...form, zoneName: e.target.value })}
                placeholder={form.isPickup ? "Ex: Loja Centro" : "Ex: Centro, Zona Sul, Bairro X"}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* Fee Amount (only for delivery) */}
            {!form.isPickup && (
              <div className="space-y-2">
                <Label>Taxa de Entrega (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.feeAmount}
                  onChange={(e) => setForm({ ...form, feeAmount: e.target.value })}
                  placeholder="0.00"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createZone.isPending || updateZone.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {createZone.isPending || updateZone.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Excluir Zona
            </DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Tem certeza que deseja excluir esta zona de entrega? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => deleteId && deleteZone.mutate({ id: deleteId })}
              disabled={deleteZone.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteZone.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ClientAdminLayout>
  );
}
