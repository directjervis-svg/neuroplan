/**
 * Admin Dashboard - Painel principal de administração
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Package, 
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Coins,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();

  const { data: metrics, isLoading } = trpc.adminStore.getStoreMetrics.useQuery();

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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie a TDAH Store e acompanhe as métricas do negócio
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/admin/products">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Gerenciar Produtos</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicionar, editar e remover produtos
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Processar Pedidos</h3>
                      <p className="text-sm text-muted-foreground">
                        Visualizar e atualizar status de pedidos
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Metrics */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : metrics && (
          <>
            {/* Store Metrics */}
            <h2 className="text-xl font-semibold mb-4">Métricas da Loja</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.revenue.totalInCents)}</p>
                      <p className="text-xs text-muted-foreground">Receita Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(metrics.revenue.totalInCents)}</p>
                      <p className="text-xs text-muted-foreground">Este Mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Coins className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{metrics.revenue.totalPointsUsed.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Pontos Usados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Package className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{metrics.products.total}</p>
                      <p className="text-xs text-muted-foreground">Produtos Ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Status */}
            <h2 className="text-xl font-semibold mb-4">Status dos Pedidos</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{metrics.orders.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{metrics.orders.processing}</p>
                  <p className="text-xs text-muted-foreground">Processando</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{metrics.orders.shipped}</p>
                  <p className="text-xs text-muted-foreground">Enviados</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{metrics.orders.delivered}</p>
                  <p className="text-xs text-muted-foreground">Entregues</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{metrics.orders.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {(metrics.products.lowStock > 0 || metrics.orders.pending > 5) && (
              <>
                <h2 className="text-xl font-semibold mb-4">Alertas</h2>
                <div className="space-y-3">
                  {metrics.products.lowStock > 0 && (
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">Estoque Baixo</p>
                            <p className="text-sm text-muted-foreground">
                              {metrics.products.lowStock} produto(s) com estoque baixo (≤5 unidades)
                            </p>
                          </div>
                          <Link href="/admin/products" className="ml-auto">
                            <Button variant="outline" size="sm">
                              Ver Produtos
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {metrics.orders.pending > 5 && (
                    <Card className="border-orange-500/50 bg-orange-500/5">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">Pedidos Pendentes</p>
                            <p className="text-sm text-muted-foreground">
                              {metrics.orders.pending} pedidos aguardando processamento
                            </p>
                          </div>
                          <Link href="/admin/orders" className="ml-auto">
                            <Button variant="outline" size="sm">
                              Ver Pedidos
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
