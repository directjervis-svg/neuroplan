/**
 * Admin Products Page - Gerenciamento de produtos da TDAH Store
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Package, 
  DollarSign, 
  Star,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

const CATEGORIES = [
  { value: "PLANNER", label: "Planner" },
  { value: "TIMER", label: "Timer" },
  { value: "FIDGET", label: "Fidget" },
  { value: "ORGANIZER", label: "Organizador" },
  { value: "BOOK", label: "Livro" },
  { value: "ACCESSORY", label: "Acessório" },
  { value: "KIT", label: "Kit" },
] as const;

type Category = typeof CATEGORIES[number]["value"];

interface ProductFormData {
  name: string;
  description: string;
  longDescription: string;
  category: Category;
  priceInCents: number;
  compareAtPriceInCents: number;
  pointsPrice: number;
  pointsOnly: boolean;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  weight: number;
  freeShipping: boolean;
}

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  longDescription: "",
  category: "ACCESSORY",
  priceInCents: 0,
  compareAtPriceInCents: 0,
  pointsPrice: 0,
  pointsOnly: false,
  stock: 0,
  imageUrl: "",
  isActive: true,
  isFeatured: false,
  weight: 0,
  freeShipping: false,
};

export default function AdminProducts() {
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

  const utils = trpc.useUtils();

  const { data: products, isLoading } = trpc.adminStore.listProducts.useQuery({
    search: search || undefined,
    category: categoryFilter !== "all" ? categoryFilter as Category : undefined,
    active: activeFilter === "all" ? undefined : activeFilter === "active",
  });

  const createMutation = trpc.adminStore.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      utils.adminStore.listProducts.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });

  const updateMutation = trpc.adminStore.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      utils.adminStore.listProducts.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });

  const deleteMutation = trpc.adminStore.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Produto desativado com sucesso!");
      utils.adminStore.listProducts.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao desativar produto: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingProduct(null);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      longDescription: product.longDescription || "",
      category: product.category || "ACCESSORY",
      priceInCents: product.priceInCents,
      compareAtPriceInCents: product.compareAtPriceInCents || 0,
      pointsPrice: product.pointsPrice || 0,
      pointsOnly: product.pointsOnly || false,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
      isFeatured: product.isFeatured || false,
      weight: product.weight || 0,
      freeShipping: product.freeShipping || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  // Verificar se é admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Produtos da TDAH Store</h1>
            <p className="text-muted-foreground">
              Gerencie o catálogo de produtos da loja
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do produto abaixo
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição curta</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição breve do produto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">Descrição completa</Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    placeholder="Descrição detalhada do produto"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.priceInCents / 100}
                      onChange={(e) => setFormData({ ...formData, priceInCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Preço original (R$)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      value={formData.compareAtPriceInCents / 100}
                      onChange={(e) => setFormData({ ...formData, compareAtPriceInCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Preço em pontos</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.pointsPrice}
                      onChange={(e) => setFormData({ ...formData, pointsPrice: parseInt(e.target.value || "0") })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Estoque</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value || "0") })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (gramas)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value || "0") })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da imagem</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Ativo</Label>
                      <p className="text-xs text-muted-foreground">Produto visível na loja</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Destaque</Label>
                      <p className="text-xs text-muted-foreground">Mostrar em destaque</p>
                    </div>
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Apenas pontos</Label>
                      <p className="text-xs text-muted-foreground">Só pode ser comprado com pontos</p>
                    </div>
                    <Switch
                      checked={formData.pointsOnly}
                      onCheckedChange={(checked) => setFormData({ ...formData, pointsOnly: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Frete grátis</Label>
                      <p className="text-xs text-muted-foreground">Sem custo de envio</p>
                    </div>
                    <Switch
                      checked={formData.freeShipping}
                      onCheckedChange={(checked) => setFormData({ ...formData, freeShipping: checked })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : products && products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {product.name}
                              {product.isFeatured && (
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          {formatCurrency(product.priceInCents)}
                        </div>
                        {product.compareAtPriceInCents && product.compareAtPriceInCents > product.priceInCents && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.compareAtPriceInCents)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.pointsPrice ? (
                          <Badge variant="secondary">
                            {product.pointsPrice.toLocaleString()} pts
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={product.stock && product.stock <= 5 ? "text-destructive font-medium" : ""}>
                          {product.stock ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Deseja desativar este produto?")) {
                                deleteMutation.mutate({ id: product.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground">
                  {search || categoryFilter !== "all" || activeFilter !== "all"
                    ? "Tente ajustar os filtros"
                    : "Comece adicionando seu primeiro produto"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
