/**
 * Admin Orders Page - Processamento de pedidos da TDAH Store
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Search, 
  Package, 
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Eye,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Coins
} from "lucide-react";
import { Link } from "wouter";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pendente", color: "bg-yellow-500" },
  { value: "PAID", label: "Pago", color: "bg-blue-500" },
  { value: "PROCESSING", label: "Processando", color: "bg-purple-500" },
  { value: "SHIPPED", label: "Enviado", color: "bg-orange-500" },
  { value: "DELIVERED", label: "Entregue", color: "bg-green-500" },
  { value: "CANCELED", label: "Cancelado", color: "bg-red-500" },
  { value: "REFUNDED", label: "Reembolsado", color: "bg-gray-500" },
] as const;

type OrderStatus = typeof ORDER_STATUSES[number]["value"];

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: ordersData, isLoading } = trpc.adminStore.listOrders.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter as OrderStatus : undefined,
    page,
    limit: 20,
  });

  const { data: metrics } = trpc.adminStore.getStoreMetrics.useQuery();

  const updateStatusMutation = trpc.adminStore.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.adminStore.listOrders.invalidate();
      utils.adminStore.getStoreMetrics.invalidate();
      setIsUpdateOpen(false);
      resetUpdateForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const cancelMutation = trpc.adminStore.cancelOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Pedido cancelado! ${data.pointsRefunded > 0 ? `${data.pointsRefunded} pontos devolvidos.` : ""}`);
      utils.adminStore.listOrders.invalidate();
      utils.adminStore.getStoreMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao cancelar pedido: ${error.message}`);
    },
  });

  const resetUpdateForm = () => {
    setNewStatus("PENDING");
    setTrackingNumber("");
    setNotes("");
    setSelectedOrder(null);
  };

  const openUpdateDialog = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingCode || "");
    setNotes(order.internalNotes || "");
    setIsUpdateOpen(true);
  };

  const openDetailsDialog = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    
    updateStatusMutation.mutate({
      id: selectedOrder.id,
      status: newStatus,
      trackingNumber: trackingNumber || undefined,
      notes: notes || undefined,
    });
  };

  const handleCancelOrder = (order: any) => {
    if (confirm(`Deseja cancelar o pedido #${order.orderNumber}? Os pontos serão devolvidos ao usuário.`)) {
      cancelMutation.mutate({
        id: order.id,
        reason: "Cancelado pelo administrador",
        refundPoints: true,
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = ORDER_STATUSES.find(s => s.value === status);
    return (
      <Badge className={`${statusInfo?.color || "bg-gray-500"} text-white`}>
        {statusInfo?.label || status}
      </Badge>
    );
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
            <h1 className="text-3xl font-bold">Pedidos da TDAH Store</h1>
            <p className="text-muted-foreground">
              Gerencie e processe os pedidos dos clientes
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.orders.pending}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.orders.processing}</p>
                    <p className="text-xs text-muted-foreground">Processando</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.orders.shipped}</p>
                    <p className="text-xs text-muted-foreground">Enviados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.orders.delivered}</p>
                    <p className="text-xs text-muted-foreground">Entregues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email, pedido..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : ordersData && ordersData.items.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.items.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-mono text-sm">
                            #{order.orderNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.shippingName || order.userName || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{order.shippingEmail || order.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(order.totalInCents)}</div>
                          {order.pointsUsed && order.pointsUsed > 0 && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {order.pointsUsed} pts
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {order.paymentMethod === "STRIPE" && <CreditCard className="h-3 w-3 mr-1" />}
                            {order.paymentMethod === "POINTS" && <Coins className="h-3 w-3 mr-1" />}
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status || "PENDING")}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(order.createdAt)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDetailsDialog(order)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openUpdateDialog(order)}
                              title="Atualizar status"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                            {order.status !== "CANCELED" && order.status !== "DELIVERED" && order.status !== "REFUNDED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancelOrder(order)}
                                title="Cancelar pedido"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {ordersData.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {((page - 1) * 20) + 1} - {Math.min(page * 20, ordersData.total)} de {ordersData.total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(ordersData.totalPages, p + 1))}
                        disabled={page === ordersData.totalPages}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
                <p className="text-muted-foreground">
                  {search || statusFilter !== "all"
                    ? "Tente ajustar os filtros"
                    : "Os pedidos aparecerão aqui quando forem realizados"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Detalhes do Pedido #{selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription>
                Informações completas do pedido
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedOrder.status || "PENDING")}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p className="font-medium">{selectedOrder.shippingName || selectedOrder.userName}</p>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {selectedOrder.shippingEmail || selectedOrder.userEmail}
                      </p>
                      {selectedOrder.shippingPhone && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {selectedOrder.shippingPhone}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço de Entrega
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p>{selectedOrder.shippingAddress}</p>
                      <p>{selectedOrder.shippingCity}, {selectedOrder.shippingState}</p>
                      <p>CEP: {selectedOrder.shippingZip}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Resumo do Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotalInCents)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frete</span>
                        <span>{formatCurrency(selectedOrder.shippingInCents || 0)}</span>
                      </div>
                      {selectedOrder.discountInCents > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Desconto</span>
                          <span>-{formatCurrency(selectedOrder.discountInCents)}</span>
                        </div>
                      )}
                      {selectedOrder.pointsUsed > 0 && (
                        <div className="flex justify-between text-purple-600">
                          <span>Pontos usados</span>
                          <span>{selectedOrder.pointsUsed} pts</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.totalInCents)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.trackingCode && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Rastreamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-mono">{selectedOrder.trackingCode}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedOrder.internalNotes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Notas Internas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedOrder.internalNotes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setIsDetailsOpen(false);
                openUpdateDialog(selectedOrder);
              }}>
                Atualizar Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateOpen} onOpenChange={(open) => {
          setIsUpdateOpen(open);
          if (!open) resetUpdateForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Atualizar Pedido #{selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription>
                Atualize o status e informações de rastreamento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Código de Rastreamento</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ex: BR123456789BR"
                />
              </div>

              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre o pedido..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
