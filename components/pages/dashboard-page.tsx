"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target, TrendingUp, Users, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getStatusColor = (percentual: number) => {
  if (percentual >= 100) return "bg-green-500";
  if (percentual >= 80) return "bg-yellow-500";
  return "bg-red-500";
};

// Componente para exibir um card de meta individual (mensal ou anual)
const MetaCard = ({ meta, title }) => (
  <div className="p-4 border rounded-lg bg-gray-50/50">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold">{title}</h4>
      <span className="text-xs text-muted-foreground">{meta.periodo}</span>
    </div>
    <p className="text-xs text-muted-foreground mb-3">{meta.descricao}</p>
    <Progress value={meta.percentual} className="h-2 mb-1" />
    <div className="flex justify-between text-xs">
      <span>R$ {meta.vendido.toLocaleString()}</span>
      <span className="text-muted-foreground">
        de R$ {meta.valorMeta.toLocaleString()}
      </span>
    </div>
    <p className="text-right text-lg font-bold text-blue-600 mt-2">
      {meta.percentual}%
    </p>
  </div>
);

// Componente para exibir o perfil e as metas de um colaborador
const ColaboradorPerformanceCard = ({ colaborador }) => {
  const totalMetaMensal = colaborador.metasMensais.reduce(
    (sum, m) => sum + m.valorMeta,
    0
  );
  const percentualGeralMensal =
    totalMetaMensal > 0
      ? Math.round((colaborador.vendidoMes / totalMetaMensal) * 100)
      : 0;

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
      <div className="flex items-start space-x-4 flex-1">
        <div
          className={`mt-1 w-3 h-3 rounded-full ${getStatusColor(
            percentualGeralMensal
          )} flex-shrink-0`}
        ></div>
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage
            src={colaborador.foto || "/placeholder.svg"}
            alt={colaborador.nome}
          />
          <AvatarFallback>
            {colaborador.nome
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{colaborador.nome}</div>
          <div className="text-sm text-gray-500">
            {colaborador.cargo} • {colaborador.equipe}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {colaborador.metasMensais.map((meta) => (
              <MetaCard key={meta.id} meta={meta} title="Meta Mensal" />
            ))}
            {colaborador.metasAnuais.map((meta) => (
              <MetaCard key={meta.id} meta={meta} title="Meta Anual" />
            ))}
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0 w-40">
        <div className="text-sm font-medium">Vendido no Mês</div>
        <div className="text-xl font-bold text-green-600">
          R$ {colaborador.vendidoMes.toLocaleString()}
        </div>
        <div className="text-sm font-medium mt-4">Comissão do Mês</div>
        <div className="text-xl font-bold text-blue-600">
          R$ {colaborador.comissaoMes.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const { getDashboardData } = useData();
  const { getPeriodLabel } = usePeriodFilter();

  const dashboardData = getDashboardData();

  if (!dashboardData) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Visão geral do desempenho da equipe</p>
        </div>
      </div>
      <FilterBar />

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Visão Mensal</TabsTrigger>
          <TabsTrigger value="annual">Visão Anual</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meta Total (Mês)
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {dashboardData.totalMetaMensal.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getPeriodLabel()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Vendido (Mês)
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {dashboardData.totalVendido.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.percentualGeralMensal}% da meta
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Colaboradores
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.colaboradoresData.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Com metas no período
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Comissões (Mês)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {dashboardData.totalComissao.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total previsto</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Individual (Mês)</CardTitle>
              <CardDescription>
                Performance individual da equipe no período selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.colaboradoresData.map((colaborador) => (
                <ColaboradorPerformanceCard
                  key={colaborador.id}
                  colaborador={colaborador}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="annual" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Individual (Anual)</CardTitle>
              <CardDescription>
                Progresso das metas anuais para o ano de{" "}
                {getPeriodLabel().split(" de ")[1]}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.colaboradoresData
                .filter((c) => c.metasAnuais.length > 0)
                .map((colaborador) => (
                  <ColaboradorPerformanceCard
                    key={colaborador.id}
                    colaborador={colaborador}
                  />
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
