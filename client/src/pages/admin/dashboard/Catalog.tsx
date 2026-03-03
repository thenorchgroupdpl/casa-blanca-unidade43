import ClientAdminLayout from "@/components/ClientAdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import ImageUploader from "@/components/ImageUploader";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Package,
  LayoutGrid,
  Search,
  ImagePlus,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Copy,
  Upload,
  X,
  AlertTriangle,
  Loader2,
  Zap,
  Check,
} from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const defaultCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
};

type ProductFormData = {
  categoryId: number | null;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  isAvailable: boolean;
  servesQuantity: string;
  sortOrder: number;
  isFeatured: boolean;
  unitValue: string;
  unit: string;
  highlightTag: string;
};

const defaultProductForm: ProductFormData = {
  categoryId: null,
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  imageUrl: "",
  isAvailable: true,
  servesQuantity: "",
  sortOrder: 0,
  isFeatured: false,
  unitValue: "",
  unit: "",
  highlightTag: "",
};

const HIGHLIGHT_OPTIONS = [
  { value: "", label: "Nenhuma" },
  { value: "mais_vendido", label: "🔥 Mais Vendido" },
  { value: "novidade", label: "✨ Novidade" },
  { value: "vegano", label: "🌱 Vegano" },
];

const UNIT_OPTIONS = [
  { value: "un", label: "un" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "L", label: "L" },
];

const getHighlightLabel = (value: string) => {
  return HIGHLIGHT_OPTIONS.find(o => o.value === value)?.label || "";
};

// ============================================
// COMPONENT
// ============================================

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(defaultCategoryForm);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  
  // Product state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(defaultProductForm);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [upsellItems, setUpsellItems] = useState<Array<{ upsellProductId: number; discountPrice: string | null }>>([]);

  const utils = trpc.useUtils();
  
  // Queries
  const { data: categories, isLoading: loadingCategories } = trpc.categories.list.useQuery();
  const { data: products, isLoading: loadingProducts } = trpc.products.list.useQuery();

  // Category mutations
  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      utils.categories.list.invalidate();
      setCategoryDialogOpen(false);
      resetCategoryForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateCategory = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      utils.categories.list.invalidate();
      setCategoryDialogOpen(false);
      resetCategoryForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoria excluída!");
      utils.categories.list.invalidate();
      utils.products.list.invalidate();
      setDeleteCategoryId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const reorderCategories = trpc.categories.reorder.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Product mutations
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      utils.products.list.invalidate();
      utils.products.grouped.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado!");
      utils.products.list.invalidate();
      utils.products.grouped.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto excluído!");
      utils.products.list.invalidate();
      utils.products.grouped.invalidate();
      setDeleteProductId(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const duplicateProduct = trpc.products.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Produto duplicado! Edite os dados da cópia.");
      utils.products.list.invalidate();
      utils.products.grouped.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadImage = trpc.products.uploadImage.useMutation({
    onError: (error) => toast.error(error.message),
  });

  // Image upload handler for ImageUploader component
  const handleImageUploadViaUploader = useCallback(async (base64Data: string, fileName: string): Promise<string> => {
    const result = await uploadImage.mutateAsync({
      imageData: base64Data,
      fileName,
      contentType: "image/png",
    });
    toast.success("Imagem enviada e processada (WebP)");
    return result.url;
  }, [uploadImage]);

  // Helper functions
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const resetCategoryForm = () => {
    setCategoryForm(defaultCategoryForm);
    setEditingCategory(null);
  };

  // Upsell query (only when editing)
  const { data: currentUpsellIds } = trpc.upsells.getIds.useQuery(
    { productId: editingProduct! },
    { enabled: !!editingProduct }
  );
  
  const setUpsellsMutation = trpc.upsells.set.useMutation({
    onError: (error) => toast.error(`Erro ao salvar upsells: ${error.message}`),
  });

  // Sync upsell items when editing product changes
  useEffect(() => {
    if (currentUpsellIds) {
      setUpsellItems(currentUpsellIds);
    }
  }, [currentUpsellIds]);

  const resetProductForm = () => {
    setProductForm(defaultProductForm);
    setEditingProduct(null);
    setImagePreview(null);
    setUpsellItems([]);
  };

  const openEditCategory = (category: NonNullable<typeof categories>[number]) => {
    setEditingCategory(category.id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "",
      imageUrl: category.imageUrl || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setCategoryDialogOpen(true);
  };

  const openEditProduct = (product: NonNullable<typeof products>[number]) => {
    setEditingProduct(product.id);
    setProductForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable,
      servesQuantity: product.servesQuantity || "",
      sortOrder: product.sortOrder,
      isFeatured: product.isFeatured,
      unitValue: product.unitValue ? String(product.unitValue) : "",
      unit: product.unit || "",
      highlightTag: product.highlightTag || "",
    });
    setImagePreview(product.imageUrl || null);
    setProductDialogOpen(true);
  };

  const openDuplicateProduct = (product: NonNullable<typeof products>[number]) => {
    setEditingProduct(null);
    setProductForm({
      categoryId: product.categoryId,
      name: `${product.name} (cópia)`,
      description: product.description || "",
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      imageUrl: product.imageUrl || "",
      isAvailable: true,
      servesQuantity: product.servesQuantity || "",
      sortOrder: product.sortOrder,
      isFeatured: false,
      unitValue: product.unitValue ? String(product.unitValue) : "",
      unit: product.unit || "",
      highlightTag: product.highlightTag || "",
    });
    setImagePreview(product.imageUrl || null);
    setProductDialogOpen(true);
  };

  const handleCategorySubmit = () => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory, data: categoryForm });
    } else {
      createCategory.mutate(categoryForm);
    }
  };

  const handleProductSubmit = () => {
    if (!productForm.categoryId) {
      toast.error("Selecione uma categoria");
      return;
    }
    if (!productForm.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    if (!productForm.price || isNaN(parseFloat(productForm.price))) {
      toast.error("Preço é obrigatório e deve ser um número válido");
      return;
    }

    // Sanitize: convert empty strings to null/undefined for decimal fields
    const payload = {
      categoryId: productForm.categoryId,
      name: productForm.name.trim(),
      description: productForm.description.trim() || undefined,
      price: productForm.price,
      originalPrice: productForm.originalPrice && productForm.originalPrice.trim() !== '' ? productForm.originalPrice.trim() : undefined,
      imageUrl: productForm.imageUrl || undefined,
      isAvailable: productForm.isAvailable,
      servesQuantity: productForm.servesQuantity.trim() || undefined,
      sortOrder: productForm.sortOrder,
      isFeatured: productForm.isFeatured,
      unitValue: productForm.unitValue && productForm.unitValue.trim() !== '' ? productForm.unitValue.trim() : undefined,
      unit: productForm.unit && productForm.unit.trim() !== '' ? productForm.unit : undefined,
      highlightTag: productForm.highlightTag && productForm.highlightTag.trim() !== '' ? productForm.highlightTag : undefined,
    };

    try {
      if (editingProduct) {
        updateProduct.mutate({ id: editingProduct, data: payload }, {
          onSuccess: () => {
            // Save upsells after product update
            if (editingProduct) {
              setUpsellsMutation.mutate({ productId: editingProduct, upsellItems });
            }
          },
          onError: (error) => {
            toast.error(`Erro ao atualizar produto: ${error.message}`);
          },
        });
      } else {
        createProduct.mutate(payload, {
          onError: (error) => {
            toast.error(`Erro ao criar produto: ${error.message}`);
          },
        });
      }
    } catch (err) {
      toast.error("Erro inesperado ao salvar produto. Tente novamente.");
      console.error("Product submit error:", err);
    }
  };

  // Category reorder
  const handleMoveCategory = useCallback((categoryId: number, direction: 'up' | 'down') => {
    if (!categories) return;
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(c => c.id === categoryId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const newSorted = [...sorted];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSorted[idx], newSorted[swapIdx]] = [newSorted[swapIdx], newSorted[idx]];

    const orderedIds = newSorted.map(c => c.id);
    reorderCategories.mutate({ orderedIds });
  }, [categories, reorderCategories]);

  // Filtered data with integrated search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    if (!searchQuery.trim()) return sorted;
    const term = searchQuery.toLowerCase();
    return sorted.filter(c => c.name.toLowerCase().includes(term));
  }, [categories, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    const term = searchQuery.toLowerCase();
    return products.filter(p => {
      const cat = categories?.find(c => c.id === p.categoryId);
      return p.name.toLowerCase().includes(term) || (cat?.name.toLowerCase().includes(term) ?? false);
    });
  }, [products, categories, searchQuery]);

  return (
    <ClientAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Catálogo</h1>
            <p className="text-zinc-400 mt-1">
              Gerencie categorias e produtos da sua loja
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="categories" className="data-[state=active]:bg-zinc-700">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Categorias
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-zinc-700">
                <Package className="h-4 w-4 mr-2" />
                Produtos
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder={activeTab === "products" ? "Buscar por nome ou categoria..." : "Buscar..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-72 bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
              
              {activeTab === "categories" ? (
                <Button
                  onClick={() => { resetCategoryForm(); setCategoryDialogOpen(true); }}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              ) : (
                <Button
                  onClick={() => { resetProductForm(); setProductDialogOpen(true); }}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  disabled={!categories || categories.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* CATEGORIES TAB (with reorder arrows) */}
          {/* ============================================ */}
          <TabsContent value="categories" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Categorias</CardTitle>
                <CardDescription className="text-zinc-400">
                  {filteredCategories?.length ?? 0} categoria(s) — A ordem aqui define a exibição na Landing Page
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="text-zinc-500 text-center py-8">Carregando...</div>
                ) : filteredCategories.length > 0 ? (
                  <div className="space-y-2">
                    {filteredCategories.map((category, idx) => {
                      const productCount = products?.filter(p => p.categoryId === category.id).length ?? 0;
                      return (
                        <div
                          key={category.id}
                          className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
                        >
                          {/* Reorder Arrows */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-600 hover:text-amber-400 disabled:opacity-30"
                              disabled={idx === 0 || reorderCategories.isPending}
                              onClick={() => handleMoveCategory(category.id, 'up')}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-600 hover:text-amber-400 disabled:opacity-30"
                              disabled={idx === filteredCategories.length - 1 || reorderCategories.isPending}
                              onClick={() => handleMoveCategory(category.id, 'down')}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Grip indicator */}
                          <GripVertical className="h-4 w-4 text-zinc-700 shrink-0" />

                          {/* Image */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                                <LayoutGrid className="h-6 w-6 text-zinc-500" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white truncate">{category.name}</p>
                                <span className="text-[10px] text-zinc-600 font-mono">/{category.slug}</span>
                              </div>
                              <p className="text-sm text-zinc-500">
                                {productCount} produto{productCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Status + Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!category.isActive && (
                              <Badge variant="outline" className="border-red-500/40 text-red-400 text-[10px]">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Inativa (cascata)
                              </Badge>
                            )}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                category.isActive
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-zinc-700 text-zinc-400"
                              }`}
                            >
                              {category.isActive ? "Ativa" : "Inativa"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-amber-500"
                              onClick={() => openEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-red-500"
                              onClick={() => setDeleteCategoryId(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <LayoutGrid className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 text-lg">Nenhuma categoria encontrada</p>
                    <p className="text-sm text-zinc-600 mt-2">
                      Clique em "Nova Categoria" para adicionar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* PRODUCTS TAB (with duplicate button + badges) */}
          {/* ============================================ */}
          <TabsContent value="products" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Produtos</CardTitle>
                <CardDescription className="text-zinc-400">
                  {filteredProducts?.length ?? 0} produto(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="text-zinc-500 text-center py-8">Carregando...</div>
                ) : !categories || categories.length === 0 ? (
                  <div className="text-center py-12">
                    <LayoutGrid className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 text-lg">Crie uma categoria primeiro</p>
                    <p className="text-sm text-zinc-600 mt-2">
                      Você precisa ter pelo menos uma categoria para adicionar produtos
                    </p>
                  </div>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors relative"
                      >
                        {/* Highlight Tag Badge */}
                        {product.highlightTag && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className={`text-xs font-semibold shadow-lg ${
                              product.highlightTag === 'mais_vendido' ? 'bg-orange-500/90 text-white' :
                              product.highlightTag === 'novidade' ? 'bg-blue-500/90 text-white' :
                              product.highlightTag === 'vegano' ? 'bg-green-500/90 text-white' :
                              'bg-zinc-600 text-white'
                            }`}>
                              {getHighlightLabel(product.highlightTag)}
                            </Badge>
                          </div>
                        )}

                        <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-zinc-700">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus className="h-8 w-8 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-amber-500 font-bold">
                                R$ {Number(product.price).toFixed(2)}
                              </p>
                              {product.unitValue && product.unit && (
                                <span className="text-xs text-zinc-500">
                                  {product.unitValue}{product.unit}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                              {categories?.find(c => c.id === product.categoryId)?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-blue-400"
                              onClick={() => openDuplicateProduct(product)}
                              title="Duplicar produto"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-amber-500"
                              onClick={() => openEditProduct(product)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-red-500"
                              onClick={() => setDeleteProductId(product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.isAvailable
                                ? "bg-green-500/20 text-green-400"
                                : "bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            {product.isAvailable ? "Disponível" : "Indisponível"}
                          </span>
                          {product.isFeatured && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 text-lg">Nenhum produto encontrado</p>
                    <p className="text-sm text-zinc-600 mt-2">
                      Clique em "Novo Produto" para adicionar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ============================================ */}
        {/* CATEGORY DIALOG (with auto-slug) */}
        {/* ============================================ */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingCategory ? "Atualize os dados da categoria" : "Preencha os dados da nova categoria"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryForm({
                      ...categoryForm,
                      name,
                      slug: generateSlug(name),
                    });
                  }}
                  placeholder="Ex: Pizzas"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug <span className="text-zinc-500 text-xs">(gerado automaticamente)</span></Label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: generateSlug(e.target.value) })}
                  placeholder="pizzas"
                  className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Descrição da categoria..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label>URL da Imagem (opcional)</Label>
                <Input
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm text-zinc-500">
                    {categoryForm.isActive ? "Categoria visível na loja" : "Categoria oculta (todos os produtos ficam indisponíveis)"}
                  </p>
                </div>
                <Switch
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                />
              </div>

              {!categoryForm.isActive && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">
                    Ao inativar esta categoria, <strong>todos os produtos</strong> vinculados a ela ficarão automaticamente indisponíveis na Landing Page (cascata).
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCategorySubmit}
                disabled={createCategory.isPending || updateCategory.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {createCategory.isPending || updateCategory.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================ */}
        {/* PRODUCT DIALOG (with upload, unit, tags) */}
        {/* ============================================ */}
        <Dialog open={productDialogOpen} onOpenChange={(open) => {
          setProductDialogOpen(open);
          if (!open) resetProductForm();
        }}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingProduct ? "Atualize os dados do produto" : "Preencha os dados do novo produto"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={productForm.categoryId?.toString() || ""}
                  onValueChange={(value) => setProductForm({ ...productForm, categoryId: parseInt(value) })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Pizza Margherita"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Descrição do produto..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              {/* Price + Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Original (opcional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="0.00"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              {/* Unit of Measure - Two distinct fields side by side */}
              <div className="space-y-2">
                <Label>Unidade de Medida (opcional)</Label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-zinc-500">Quantidade</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.unitValue}
                      onChange={(e) => setProductForm({ ...productForm, unitValue: e.target.value })}
                      placeholder="Ex: 700"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="w-28 space-y-1">
                    <span className="text-xs text-zinc-500">Unidade</span>
                    <Select
                      value={productForm.unit || "none"}
                      onValueChange={(value) => setProductForm({ ...productForm, unit: value === "none" ? "" : value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectItem value="none">—</SelectItem>
                        {UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {productForm.unitValue && productForm.unit && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Exibirá como: <span className="text-amber-400 font-medium">{productForm.unitValue}{productForm.unit}</span>
                  </p>
                )}
              </div>

              {/* Image Upload (via ImageUploader global component) */}
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <ImageUploader
                  presetKey="PRODUCT_CARD"
                  value={productForm.imageUrl || null}
                  onChange={(url) => {
                    setProductForm(prev => ({ ...prev, imageUrl: url }));
                    setImagePreview(url);
                  }}
                  onRemove={() => {
                    setProductForm(prev => ({ ...prev, imageUrl: "" }));
                    setImagePreview(null);
                  }}
                  onUpload={handleImageUploadViaUploader}
                  uploading={uploadImage.isPending}
                />
              </div>

              {/* Highlight Tag */}
              <div className="space-y-2">
                <Label>Etiqueta de Destaque</Label>
                <Select
                  value={productForm.highlightTag || "none"}
                  onValueChange={(value) => setProductForm({ ...productForm, highlightTag: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="mais_vendido">🔥 Mais Vendido</SelectItem>
                    <SelectItem value="novidade">✨ Novidade</SelectItem>
                    <SelectItem value="vegano">🌱 Vegano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Serves Quantity */}
              <div className="space-y-2">
                <Label>Serve quantas pessoas? (opcional)</Label>
                <Input
                  value={productForm.servesQuantity}
                  onChange={(e) => setProductForm({ ...productForm, servesQuantity: e.target.value })}
                  placeholder="Ex: Serve 2 pessoas"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              {/* Available Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                <div>
                  <Label>Disponível</Label>
                  <p className="text-sm text-zinc-500">
                    {productForm.isAvailable ? "Produto à venda" : "Produto indisponível"}
                  </p>
                </div>
                <Switch
                  checked={productForm.isAvailable}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, isAvailable: checked })}
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                <div>
                  <Label>Destaque</Label>
                  <p className="text-sm text-zinc-500">
                    {productForm.isFeatured ? "Aparece em destaque" : "Produto normal"}
                  </p>
                </div>
                <Switch
                  checked={productForm.isFeatured}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, isFeatured: checked })}
                />
              </div>

              {/* Order Bump / Upsell Section */}
              {editingProduct && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Order Bump (Sugestões)
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Selecione produtos que serão sugeridos ao cliente ao adicionar este item ao carrinho.
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-zinc-700 p-2 bg-zinc-800/50">
                    {products && products
                      .filter(p => p.id !== editingProduct && p.isAvailable)
                      .map(p => {
                        const upsellItem = upsellItems.find(u => u.upsellProductId === p.id);
                        const isSelected = !!upsellItem;
                        return (
                          <div key={p.id} className="space-y-1">
                            <button
                              type="button"
                              onClick={() => {
                                setUpsellItems(prev =>
                                  isSelected
                                    ? prev.filter(u => u.upsellProductId !== p.id)
                                    : [...prev, { upsellProductId: p.id, discountPrice: null }]
                                );
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                                isSelected
                                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200'
                                  : 'hover:bg-zinc-700 text-zinc-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-black" />}
                              </div>
                              {p.imageUrl && (
                                <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                              )}
                              <span className="truncate flex-1">{p.name}</span>
                              <span className="text-xs text-zinc-500 flex-shrink-0">
                                R$ {Number(p.price).toFixed(2)}
                              </span>
                            </button>
                            {/* Discount Price Field - shown when product is selected */}
                            {isSelected && (
                              <div className="ml-7 flex items-center gap-2 px-3 pb-2">
                                <label className="text-xs text-zinc-400 whitespace-nowrap">Preço no Bump:</label>
                                <div className="relative flex-1 max-w-[160px]">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder={Number(p.price).toFixed(2)}
                                    value={upsellItem?.discountPrice ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setUpsellItems(prev =>
                                        prev.map(u =>
                                          u.upsellProductId === p.id
                                            ? { ...u, discountPrice: val === '' ? null : val }
                                            : u
                                        )
                                      );
                                    }}
                                    className="w-full pl-8 pr-2 py-1 text-xs rounded bg-zinc-900 border border-zinc-600 text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                                  />
                                </div>
                                {upsellItem?.discountPrice && Number(upsellItem.discountPrice) < Number(p.price) && (
                                  <span className="text-xs text-green-400">
                                    -{Math.round((1 - Number(upsellItem.discountPrice) / Number(p.price)) * 100)}%
                                  </span>
                                )}
                                {!upsellItem?.discountPrice && (
                                  <span className="text-xs text-zinc-600">Sem desconto</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {(!products || products.filter(p => p.id !== editingProduct && p.isAvailable).length === 0) && (
                      <p className="text-xs text-zinc-500 text-center py-2">Nenhum outro produto disponível</p>
                    )}
                  </div>
                  {upsellItems.length > 0 && (
                    <p className="text-xs text-amber-400">
                      {upsellItems.length} produto{upsellItems.length > 1 ? 's' : ''} selecionado{upsellItems.length > 1 ? 's' : ''} como sugestão
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setProductDialogOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleProductSubmit}
                disabled={createProduct.isPending || updateProduct.isPending || uploadImage.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {createProduct.isPending || updateProduct.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category Confirmation */}
        <Dialog open={deleteCategoryId !== null} onOpenChange={() => setDeleteCategoryId(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Excluir Categoria</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Tem certeza? Todos os produtos desta categoria também serão excluídos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteCategoryId(null)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteCategoryId && deleteCategory.mutate({ id: deleteCategoryId })}
                disabled={deleteCategory.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteCategory.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Product Confirmation */}
        <Dialog open={deleteProductId !== null} onOpenChange={() => setDeleteProductId(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Excluir Produto</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Tem certeza que deseja excluir este produto?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteProductId(null)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteProductId && deleteProduct.mutate({ id: deleteProductId })}
                disabled={deleteProduct.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteProduct.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ClientAdminLayout>
  );
}
