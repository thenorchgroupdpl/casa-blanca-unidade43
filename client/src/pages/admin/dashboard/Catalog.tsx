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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Package,
  LayoutGrid,
  Search,
  ImagePlus
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Category Form
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

// Product Form
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
};

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

  // Product mutations
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      utils.products.list.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado!");
      utils.products.list.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto excluído!");
      utils.products.list.invalidate();
      setDeleteProductId(null);
    },
    onError: (error) => toast.error(error.message),
  });

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

  const resetProductForm = () => {
    setProductForm(defaultProductForm);
    setEditingProduct(null);
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
    });
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
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct, data: { ...productForm, categoryId: productForm.categoryId } });
    } else {
      createProduct.mutate({ ...productForm, categoryId: productForm.categoryId });
    }
  };

  // Filtered data
  const filteredCategories = categories?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-zinc-900 border-zinc-800 text-white"
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

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Categorias</CardTitle>
                <CardDescription className="text-zinc-400">
                  {filteredCategories?.length ?? 0} categoria(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="text-zinc-500 text-center py-8">Carregando...</div>
                ) : filteredCategories && filteredCategories.length > 0 ? (
                  <div className="space-y-3">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                              <LayoutGrid className="h-6 w-6 text-zinc-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{category.name}</p>
                            <p className="text-sm text-zinc-500">
                              {products?.filter(p => p.categoryId === category.id).length ?? 0} produtos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                    ))}
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

          {/* Products Tab */}
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
                        className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                      >
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
                          <div>
                            <p className="font-semibold text-white">{product.name}</p>
                            <p className="text-amber-500 font-bold mt-1">
                              R$ {Number(product.price).toFixed(2)}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {categories?.find(c => c.id === product.categoryId)?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-amber-500"
                              onClick={() => openEditProduct(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-red-500"
                              onClick={() => setDeleteProductId(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
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

        {/* Category Dialog */}
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
                  onChange={(e) => setCategoryForm({
                    ...categoryForm,
                    name: e.target.value,
                    slug: editingCategory ? categoryForm.slug : generateSlug(e.target.value),
                  })}
                  placeholder="Ex: Pizzas"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="pizzas"
                  className="bg-zinc-800 border-zinc-700"
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
                    {categoryForm.isActive ? "Categoria visível" : "Categoria oculta"}
                  </p>
                </div>
                <Switch
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                />
              </div>
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

        {/* Product Dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
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
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={productForm.categoryId?.toString() || ""}
                  onValueChange={(value) => setProductForm({ ...productForm, categoryId: parseInt(value) })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Pizza Margherita"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Descrição do produto..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

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

              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Serve quantas pessoas? (opcional)</Label>
                <Input
                  value={productForm.servesQuantity}
                  onChange={(e) => setProductForm({ ...productForm, servesQuantity: e.target.value })}
                  placeholder="Ex: Serve 2 pessoas"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

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
                disabled={createProduct.isPending || updateProduct.isPending}
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
