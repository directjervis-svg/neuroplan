/**
 * Rewards and TDAH Store Page
 * Redeem points for discounts and physical products
 */

import { useState } from "react";
import DashboardLayoutNeuroExecucao from "@/components/DashboardLayoutNeuroExecucao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Gift, 
  Star, 
  ShoppingBag, 
  Ticket, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Copy,
  ExternalLink,
  Loader2,
  Coins,
  Award,
  Sparkles,
  Timer,
  BookOpen,
  Puzzle,
  Box
} from "lucide-react";

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
  PLANNER: <BookOpen className="h-5 w-5" />,
  TIMER: <Timer className="h-5 w-5" />,
  FIDGET: <Puzzle className="h-5 w-5" />,
  ORGANIZER: <Box className="h-5 w-5" />,
  BOOK: <BookOpen className="h-5 w-5" />,
  ACCESSORY: <Star className="h-5 w-5" />,
  KIT: <Package className="h-5 w-5" />,
};

// Reward type badges
const rewardTypeBadges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  DISCOUNT: { label: "Desconto", variant: "default" },
  PRODUCT: { label: "Produto", variant: "secondary" },
  FEATURE: { label: "Recurso", variant: "outline" },
  BADGE: { label: "Emblema", variant: "outline" },
};

// Status badges
const statusBadges: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-600" },
  PROCESSING: { label: "Processando", color: "bg-blue-500/20 text-blue-600" },
  COMPLETED: { label: "Concluído", color: "bg-green-500/20 text-green-600" },
  SHIPPED: { label: "Enviado", color: "bg-purple-500/20 text-purple-600" },
  DELIVERED: { label: "Entregue", color: "bg-green-500/20 text-green-600" },
  CANCELED: { label: "Cancelado", color: "bg-red-500/20 text-red-600" },
  REFUNDED: { label: "Reembolsado", color: "bg-gray-500/20 text-gray-600" },
};

export default function Rewards() {
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "BR",
  });

  // Queries
  const { data: balance, isLoading: loadingBalance } = trpc.rewards.getBalance.useQuery();
  const { data: rewards, isLoading: loadingRewards } = trpc.rewards.getAvailableRewards.useQuery();
  const { data: redemptions, isLoading: loadingRedemptions } = trpc.rewards.getRedemptions.useQuery();
  const { data: transactions } = trpc.rewards.getTransactions.useQuery({ limit: 10 });
  const { data: products, isLoading: loadingProducts } = trpc.rewards.getStoreProducts.useQuery({});

  // Mutations
  const utils = trpc.useUtils();
  const redeemMutation = trpc.rewards.redeemReward.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      setShowRedeemDialog(false);
      setSelectedReward(null);
      utils.rewards.getBalance.invalidate();
      utils.rewards.getAvailableRewards.invalidate();
      utils.rewards.getRedemptions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRedeem = () => {
    if (!selectedReward) return;

    const input: any = { rewardId: selectedReward.id };
    
    if (selectedReward.type === 'PRODUCT') {
      if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zip) {
        toast.error("Preencha todas as informações de envio");
        return;
      }
      input.shippingInfo = shippingInfo;
    }

    redeemMutation.mutate(input);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  if (loadingBalance) {
    return (
      <DashboardLayoutNeuroExecucao>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </DashboardLayoutNeuroExecucao>
    );
  }

  return (
    <DashboardLayoutNeuroExecucao>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Gift className="h-6 w-6 text-[#22C55E]" />
              Recompensas
            </h1>
            <p className="text-muted-foreground mt-1">
              Troque seus pontos por descontos e produtos exclusivos
            </p>
          </div>
        </div>

        {/* Points Balance Card */}
        <Card className="bg-gradient-to-br from-[#22C55E]/10 to-[#FF8C42]/10 border-[#22C55E]/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Coins className="h-6 w-6 text-[#FF8C42]" />
                  <span className="text-3xl font-bold text-foreground">{balance?.balance || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">pontos disponíveis</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Ganho</p>
                <div className="flex items-center gap-1 justify-center">
                  <TrendingUp className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-xl font-semibold text-[#22C55E]">{balance?.totalEarned || 0}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Gasto</p>
                <div className="flex items-center gap-1 justify-center">
                  <ShoppingBag className="h-4 w-4 text-[#FF8C42]" />
                  <span className="text-xl font-semibold text-[#FF8C42]">{balance?.totalSpent || 0}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Resgates Pendentes</p>
                <div className="flex items-center gap-1 justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xl font-semibold">{balance?.pendingRedemptions || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rewards" className="gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Recompensas</span>
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">TDAH Store</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Transações</span>
            </TabsTrigger>
          </TabsList>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingRewards ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
                </div>
              ) : rewards && rewards.length > 0 ? (
                rewards.map((reward) => (
                  <Card key={reward.id} className={`relative overflow-hidden ${!reward.canRedeem ? 'opacity-60' : ''}`}>
                    {reward.isPremiumOnly && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-[#FF8C42] text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge {...rewardTypeBadges[reward.type]}>
                            {rewardTypeBadges[reward.type].label}
                          </Badge>
                          <CardTitle className="mt-2 text-lg">{reward.name}</CardTitle>
                        </div>
                      </div>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="h-5 w-5 text-[#FF8C42]" />
                          <span className="text-xl font-bold">{reward.pointsCost}</span>
                          <span className="text-sm text-muted-foreground">pontos</span>
                        </div>
                        {reward.stock !== null && (
                          <Badge variant="outline">
                            {reward.stock} restantes
                          </Badge>
                        )}
                      </div>
                      
                      {reward.type === 'DISCOUNT' && reward.discountValue && (
                        <div className="mt-3 p-2 bg-[#22C55E]/10 rounded-lg">
                          <p className="text-sm font-medium text-[#22C55E]">
                            {reward.discountType === 'PERCENTAGE' 
                              ? `${reward.discountValue}% de desconto`
                              : `R$ ${(reward.discountValue / 100).toFixed(2)} de desconto`}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white"
                        disabled={!reward.canRedeem}
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowRedeemDialog(true);
                        }}
                      >
                        {reward.canRedeem ? 'Resgatar' : 'Pontos Insuficientes'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma recompensa disponível no momento</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Continue completando tarefas para ganhar pontos!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TDAH Store Tab */}
          <TabsContent value="store" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#22C55E]" />
                  TDAH Store
                </h2>
                <p className="text-sm text-muted-foreground">
                  Produtos físicos para ajudar na sua produtividade
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingProducts ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
                </div>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.imageUrl && (
                      <div className="aspect-square bg-muted relative">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                        {product.isFeatured && (
                          <Badge className="absolute top-2 left-2 bg-[#FF8C42]">
                            Destaque
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {categoryIcons[product.category || 'ACCESSORY']}
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.pointsPrice ? (
                            <div className="flex items-center gap-2">
                              <Coins className="h-5 w-5 text-[#FF8C42]" />
                              <span className="text-xl font-bold">{product.pointsPrice}</span>
                              <span className="text-sm text-muted-foreground">pontos</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">
                                R$ {(product.priceInCents / 100).toFixed(2)}
                              </span>
                              {product.compareAtPriceInCents && (
                                <span className="text-sm text-muted-foreground line-through">
                                  R$ {(product.compareAtPriceInCents / 100).toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {product.stock !== null && product.stock <= (product.lowStockThreshold || 5) && (
                          <Badge variant="destructive">
                            Últimas unidades
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant={product.pointsOnly ? "default" : "outline"}
                      >
                        {product.pointsOnly ? 'Trocar Pontos' : 'Ver Detalhes'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Loja em breve!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Estamos preparando produtos incríveis para você
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <h2 className="text-xl font-semibold">Meus Resgates</h2>
            
            {loadingRedemptions ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
              </div>
            ) : redemptions && redemptions.length > 0 ? (
              <div className="space-y-4">
                {redemptions.map((redemption) => (
                  <Card key={redemption.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-[#22C55E]/10 rounded-lg">
                            {redemption.reward?.type === 'DISCOUNT' ? (
                              <Ticket className="h-6 w-6 text-[#22C55E]" />
                            ) : (
                              <Package className="h-6 w-6 text-[#22C55E]" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{redemption.reward?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {redemption.pointsSpent} pontos • {new Date(redemption.redeemedAt).toLocaleDateString('pt-BR')}
                            </p>
                            
                            {redemption.couponCode && (
                              <div className="mt-2 flex items-center gap-2">
                                <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                  {redemption.couponCode}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(redemption.couponCode!)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                {redemption.couponUsed && (
                                  <Badge variant="secondary">Usado</Badge>
                                )}
                              </div>
                            )}
                            
                            {redemption.trackingCode && (
                              <div className="mt-2 flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Rastreio: {redemption.trackingCode}</span>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Badge className={statusBadges[redemption.status || 'PENDING'].color}>
                          {statusBadges[redemption.status || 'PENDING'].label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum resgate realizado ainda</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore as recompensas disponíveis!
                </p>
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <h2 className="text-xl font-semibold">Histórico de Pontos</h2>
            
            {transactions?.transactions && transactions.transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10'}`}>
                        {tx.amount > 0 ? (
                          <TrendingUp className="h-4 w-4 text-[#22C55E]" />
                        ) : (
                          <ShoppingBag className="h-4 w-4 text-[#EF4444]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.amount > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saldo: {tx.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma transação ainda</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete tarefas para ganhar pontos!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Redeem Dialog */}
        <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Resgatar Recompensa</DialogTitle>
              <DialogDescription>
                {selectedReward?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span>Custo:</span>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-[#FF8C42]" />
                  <span className="font-bold">{selectedReward?.pointsCost} pontos</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span>Seu saldo:</span>
                <span className="font-bold">{balance?.balance || 0} pontos</span>
              </div>

              {selectedReward?.type === 'PRODUCT' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">Informações de Envio</h4>
                    
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input 
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input 
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Rua, número, complemento"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input 
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Input 
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="UF"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input 
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, zip: e.target.value }))}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRedeemDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleRedeem}
                disabled={redeemMutation.isPending}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
              >
                {redeemMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Confirmar Resgate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayoutNeuroExecucao>
  );
}
