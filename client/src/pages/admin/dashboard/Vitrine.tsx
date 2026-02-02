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
import { LayoutGrid, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { data: homeRows, isLoading: loadingHomeRows } = trpc.store.getHomeRows.useQuery();

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

  const handleSave = async () => {
    try {
      // Save each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.categoryId) {
          await updateHomeRow.mutateAsync({
            rowNumber: i + 1,
            categoryId: row.categoryId,
            customTitle: row.customTitle || undefined,
          });
        } else {
          // If no category selected, delete the row
          await deleteHomeRow.mutateAsync({ rowNumber: i + 1 });
        }
      }
      toast.success("Vitrine atualizada com sucesso!");
      setHasChanges(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const isLoading = loadingCategories || loadingHomeRows;

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Vitrine</h1>
            <p className="text-zinc-400 mt-1">
              Configure as 3 fileiras de produtos da página inicial
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateHomeRow.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateHomeRow.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <p className="text-amber-400 text-sm">
              💡 A vitrine exibe até 3 fileiras de produtos na página inicial da sua loja. 
              Cada fileira mostra os produtos de uma categoria específica.
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
                  onClick={() => window.location.href = '/admin/dashboard/catalog'}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Ir para Catálogo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((row, index) => (
              <Card key={index} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                      {index + 1}
                    </span>
                    Fileira {index + 1}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {row.categoryId 
                      ? `Exibindo: ${categories.find(c => c.id === row.categoryId)?.name}`
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
                          handleRowChange(index, "categoryId", value === "none" ? null : parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="none">Nenhuma (ocultar fileira)</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Título Personalizado (opcional)</Label>
                      <Input
                        value={row.customTitle}
                        onChange={(e) => handleRowChange(index, "customTitle", e.target.value)}
                        placeholder={
                          row.categoryId 
                            ? categories.find(c => c.id === row.categoryId)?.name 
                            : "Título da fileira"
                        }
                        className="bg-zinc-800 border-zinc-700"
                        disabled={!row.categoryId}
                      />
                      <p className="text-xs text-zinc-500">
                        Se vazio, usa o nome da categoria
                      </p>
                    </div>
                  </div>

                  {row.categoryId && (
                    <div className="mt-4 p-4 rounded-lg bg-zinc-800/50">
                      <p className="text-sm text-zinc-400 mb-2">Preview:</p>
                      <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {categories
                          .find(c => c.id === row.categoryId)
                          ?.name && (
                          <div className="flex-shrink-0 w-32 h-20 rounded-lg bg-zinc-700 flex items-center justify-center">
                            <span className="text-xs text-zinc-500">Produto 1</span>
                          </div>
                        )}
                        <div className="flex-shrink-0 w-32 h-20 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <span className="text-xs text-zinc-500">Produto 2</span>
                        </div>
                        <div className="flex-shrink-0 w-32 h-20 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <span className="text-xs text-zinc-500">Produto 3</span>
                        </div>
                        <div className="flex-shrink-0 w-32 h-20 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                          <span className="text-xs text-zinc-600">...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Save Button (mobile) */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden">
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
