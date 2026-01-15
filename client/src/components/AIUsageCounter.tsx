/**
 * AI Usage Counter Component
 * Mostra ao usuário quantas chamadas de IA ele já usou hoje
 * Resolve problema crítico: usuário não vê limite se aproximando
 */

import React from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AIUsageCounter() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: usage, isLoading } = trpc.aiMetrics.getUsageToday.useQuery();

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const isPro = user?.subscriptionPlan === 'PRO';
  const limit = isPro ? Infinity : 100;
  const count = usage?.count || 0;
  const percentage = isPro ? 0 : Math.min((count / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <Card className={isNearLimit ? 'border-orange-500' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Usada Hoje
          </CardTitle>
          {isPro && (
            <Badge variant="default" className="gap-1">
              <Crown className="h-3 w-3" />
              Pro
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isPro ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Zap className="h-6 w-6 text-yellow-500" />
              Ilimitado
            </div>
            <p className="text-xs text-muted-foreground">
              Você tem acesso ilimitado à IA como usuário Pro
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{count}</span>
              <span className="text-sm text-muted-foreground">/ {limit}</span>
            </div>
            
            <Progress 
              value={percentage} 
              className={isNearLimit ? 'bg-orange-100' : ''}
            />

            {isAtLimit ? (
              <div className="space-y-2">
                <p className="text-xs text-orange-600 font-medium">
                  ⚠️ Limite diário atingido
                </p>
                <Button size="sm" className="w-full" variant="default">
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade para Pro (Ilimitado)
                </Button>
              </div>
            ) : isNearLimit ? (
              <p className="text-xs text-orange-600">
                ⚠️ Você está próximo do limite diário
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Redefine às 00:00 (horário de Brasília)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
