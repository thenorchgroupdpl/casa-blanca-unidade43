import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  GripVertical,
  LayoutGrid,
  Save,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type RowConfig = {
  categoryId: number | null;
  customTitle: string;
};

export default function VitrinePage() {
  const [rows, setRows] = useState<RowConfig[]>([
    { categoryId: null, customTitle: "" },
    { categoryId: null, customTitle: "" },
    { categoryId: null, customTitle: "" },
  ]);
  const [hasChanges, setHasChanges] = useState(false);

  const utils = trpc.useUtils();
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();
  const { data: allProducts } = trpc.products.list.useQuery();
  const { data: homeRows, isLoading: loadingHomeRows } = trpc.store.getHomeRows.useQuery();
  const { data: roleData } = trpc.auth.getRole.useQuery();

  const updateHomeRow = trpc.store.updateHomeRow.useMutation({
    onSuccess: () => {
      utils.store.getHomeRows.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteHomeRow = trpc.store.deleteHomeRow.useMutation({
    onSuccess: () => {
      utils.store.getHomeRows.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Build a map of categoryId -> active products
  const productsByCategoryId = useMemo(() => {
    const map = new Map<number, Array<{ id: number; name: string; imageUrl: string | null; isAvailable: boolean }>>();
    if (!allProducts) return map;
    for (const p of allProducts) {
      const list = map.get(p.categoryId) || [];
      list.push({ id: p.id, name: p.name, imageUrl: p.imageUrl, isAvailable: p.isAvailable });
      map.set(p.categoryId, list);
    }
    return map;
  }, [allProducts]);

  // Count active products per category
  const activeProductCount = useMemo(() => {
    const map = new Map<number, number>();
    Array.from(productsByCategoryId.entries()).forEach(([catId, prods]) => {
      map.set(catId, prods.filter((p: { isAvailable: boolean }) => p.isAvailable).length);
    });
    return map;
  }, [productsByCategoryId]);

  // Load existing home rows
  useEffect(() => {
    if (homeRows) {
      const newRows: RowConfig[] = [
        { categoryId: null, customTitle: "" },
        { categoryId: null, customTitle: "" },
        { categoryId: null, customTitle: "" },
      ];

      homeRows.forEach((row) => {
        if (row.rowNumber >= 1 && row.rowNumber <= 3) {
          newRows[row.rowNumber - 1] = {
            categoryId: row.categoryId,
            customTitle: row.customTitle || "",
          };
        }
      });

      setRows(newRows);
      setHasChanges(false);
    }
  }, [homeRows]);

  const handleRowChange = (index: number, field: keyof RowConfig, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
    setHasChanges(true);
  };

  // Reorder rows (swap with adjacent)
  const moveRow = (index: number, direction: "up" | "down") => {
    const newRows = [...rows];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;
    [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
    setRows(newRows);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.categoryId) {
          await updateHomeRow.mutateAsync({
            rowNumber: i + 1,
            categoryId: row.categoryId,
            customTitle: row.customTitle || undefined,
          });
        } else {
          await deleteHomeRow.mutateAsync({ rowNumber: i + 1 });
        }
      }
      toast.success("Vitrine atualizada com sucesso!");
      setHasChanges(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleOpenStore = () => {
    const slug = roleData?.tenantSlug;
    window.open(slug ? `/${slug}` : "/", "_blank");
  };

  const isLoading = loadingCategories || loadingHomeRows;

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Vitrine</h1>
            <p className="text-zinc-400 mt-1">
              Configure as 3 fileiras de produtos da página inicial
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleOpenStore}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Minha Loja
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateHomeRow.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateHomeRow.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <p className="text-amber-400 text-sm">
              💡 A vitrine exibe até 3 fileiras de produtos na página inicial da sua loja.
              Cada fileira mostra os produtos de uma categoria específica. Use as setas para reordenar.
            </p>
          </CardContent>
        </Card>

        {/* Rows Configuration */}
        {isLoading ? (
          <div className="text-zinc-500 text-center py-12">Carregando...</div>
        ) : !categories || categories.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12">
              <div className="text-center">
                <LayoutGrid className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg">Crie categorias primeiro</p>
                <p className="text-sm text-zinc-600 mt-2">
                  Você precisa ter categorias com produtos para configurar a vitrine
                </p>
                <Button
                  onClick={() => (window.location.href = "/admin/dashboard/catalog")}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Ir para Catálogo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((row, index) => {
              const selectedCategory = row.categoryId
                ? categories.find((c) => c.id === row.categoryId)
                : null;
              const activeCount = row.categoryId
                ? activeProductCount.get(row.categoryId) ?? 0
                : 0;
              const categoryProducts = row.categoryId
                ? (productsByCategoryId.get(row.categoryId) || []).filter(p => p.isAvailable)
                : [];
              const isEmpty = row.categoryId !== null && activeCount === 0;
              const isInactive = selectedCategory && !selectedCategory.isActive;

              return (
                <Card
                  key={index}
                  className={`bg-zinc-900 border-zinc-800 transition-all ${
                    isEmpty || isInactive ? "border-yellow-600/40" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-zinc-600" />
                        <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm">
                          {index + 1}
                        </span>
                        Fileira {index + 1}
                      </CardTitle>
                      {/* Reorder Arrows */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveRow(index, "up")}
                          disabled={index === 0}
                          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveRow(index, "down")}
                          disabled={index === rows.length - 1}
                          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-zinc-400 ml-[52px]">
                      {row.categoryId
                        ? `Exibindo: ${selectedCategory?.name || "Categoria removida"} (${activeCount} produto${activeCount !== 1 ? "s" : ""} ativo${activeCount !== 1 ? "s" : ""})`
                        : "Nenhuma categoria selecionada (fileira vazia)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={row.categoryId?.toString() || "none"}
                          onValueChange={(value) =>
                            handleRowChange(
                              index,
                              "categoryId",
                              value === "none" ? null : parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectItem value="none">Nenhuma (ocultar fileira)</SelectItem>
                            {categories.map((cat) => {
                              const catActiveCount = activeProductCount.get(cat.id) ?? 0;
                              return (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.name}
                                  {!cat.isActive && " (inativa)"}
                                  {cat.isActive && catActiveCount === 0 && " (sem produtos)"}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Título Personalizado (opcional)</Label>
                        <Input
                          value={row.customTitle}
                          onChange={(e) =>
                            handleRowChange(index, "customTitle", e.target.value)
                          }
                          placeholder={
                            selectedCategory?.name || "Título da fileira"
                          }
                          className="bg-zinc-800 border-zinc-700"
                          disabled={!row.categoryId}
                        />
                        <p className="text-xs text-zinc-500">
                          Se vazio, usa o nome da categoria
                        </p>
                      </div>
                    </div>

                    {/* Alert: Inactive Category */}
                    {isInactive && (
                      <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-400">
                          <strong>Atenção:</strong> Esta categoria está inativa. Ela não aparecerá no site até ser reativada no Catálogo.
                        </p>
                      </div>
                    )}

                    {/* Alert: Empty Category */}
                    {!isInactive && isEmpty && (
                      <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-400">
                          <strong>Atenção:</strong> Esta categoria não possui produtos disponíveis. Ela não aparecerá no site.
                        </p>
                      </div>
                    )}

                    {/* Dynamic Preview with mini-cards */}
                    {row.categoryId && !isEmpty && !isInactive && (
                      <div className="mt-4 p-4 rounded-lg bg-zinc-800/50">
                        <p className="text-sm text-zinc-400 mb-3">Preview:</p>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                          {categoryProducts.slice(0, 3).map((prod) => (
                            <div
                              key={prod.id}
                              className="flex-shrink-0 w-36 rounded-lg bg-zinc-700/80 border border-zinc-600/50 overflow-hidden"
                            >
                              {/* Product Image */}
                              <div className="aspect-square w-full bg-zinc-700 overflow-hidden">
                                {prod.imageUrl ? (
                                  <img
                                    src={prod.imageUrl}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 text-zinc-500" />
                                  </div>
                                )}
                              </div>
                              {/* Product Name */}
                              <div className="p-2">
                                <p className="text-xs text-zinc-300 font-medium line-clamp-1">
                                  {prod.name}
                                </p>
                              </div>
                            </div>
                          ))}
                          {categoryProducts.length > 3 && (
                            <div className="flex-shrink-0 w-36 h-[164px] rounded-lg bg-zinc-700/40 border border-zinc-600/30 flex items-center justify-center">
                              <span className="text-sm text-zinc-500">
                                +{categoryProducts.length - 3} mais
                              </span>
                            </div>
                          )}
                          {categoryProducts.length === 0 && (
                            <p className="text-xs text-zinc-500">Nenhum produto ativo</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Save Button (mobile) */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
            <Button
              onClick={handleSave}
              disabled={updateHomeRow.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateHomeRow.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        )}
      </div>
    </ClientAdminLayout>
  );
}
