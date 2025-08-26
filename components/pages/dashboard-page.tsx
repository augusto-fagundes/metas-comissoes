"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Building,
  Store,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PeriodComparison } from "@/components/period-comparison";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getStatusColorClass = (percentual: number) => {
  if (percentual >= 100) return "text-green-500";
  if (percentual >= 80) return "text-yellow-500";
  return "text-red-500";
};

// Componente para exibir o perfil e as metas de um colaborador
const ColaboradorPerformanceCard = ({ colaborador }) => {
  const metaMensalPrincipal = colaborador.metasMensais?.[0] || {
    percentual: 0,
    vendido: 0,
    valorMeta: 0,
    descricao: "Nenhuma meta mensal definida",
  };

  const metaAnualPrincipal = colaborador.metasAnuais?.[0];
  const statusColor = getStatusColorClass(metaMensalPrincipal.percentual);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
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
          <CardTitle>{colaborador.nome}</CardTitle>
          <CardDescription>
            {colaborador.cargo} • {colaborador.equipe}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {/* Meta Mensal */}
        <div>
          <Label className="text-xs">{metaMensalPrincipal.descricao}</Label>
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>R$ {metaMensalPrincipal.vendido.toLocaleString()}</span>
            <span>
              Meta: R$ {metaMensalPrincipal.valorMeta.toLocaleString()}
            </span>
          </div>
          <Progress
            value={metaMensalPrincipal.percentual}
            className="h-2 mt-1"
          />
        </div>
        {/* Meta Anual */}
        {metaAnualPrincipal && (
          <div>
            <Label className="text-xs">{metaAnualPrincipal.descricao}</Label>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>R$ {metaAnualPrincipal.vendido.toLocaleString()}</span>
              <span>
                Meta: R$ {metaAnualPrincipal.valorMeta.toLocaleString()}
              </span>
            </div>
            <Progress
              value={metaAnualPrincipal.percentual}
              className="h-2 mt-1"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4 text-center">
        <div className="space-y-1 rounded-md border p-2">
          <p className="text-xs text-muted-foreground">Meta Mês</p>
          <p className={cn("text-2xl font-bold", statusColor)}>
            {metaMensalPrincipal.percentual}%
          </p>
        </div>
        <div className="space-y-1 rounded-md border p-2">
          <p className="text-xs text-muted-foreground">Comissão (Mês)</p>
          <p className="text-2xl font-bold text-blue-600">
            R$ {colaborador.comissaoMes.toLocaleString()}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

const PIE_COLORS = {
  vendido: "#3b82f6", // Azul
  faltante: "#e5e7eb", // Cinza
};

export function DashboardPage() {
  const { getDashboardData, lojas } = useData();
  const { getPeriodLabel } = usePeriodFilter();
  const [lojaSelecionadaId, setLojaSelecionadaId] = useState<string>("todas");

  const dashboardData = getDashboardData();

  const dadosVisaoAtual = useMemo(() => {
    if (!dashboardData) return null;

    if (lojaSelecionadaId === "todas") {
      return {
        nomeVisao: "Visão Geral (Todas as Lojas)",
        ...dashboardData,
      };
    }

    const idLoja = parseInt(lojaSelecionadaId, 10);
    const dadosEquipe = dashboardData.desempenhoPorEquipe.find(
      (e) => e.loja.id === idLoja
    );
    if (!dadosEquipe) return null;

    const colaboradoresDaLoja = dashboardData.colaboradoresData.filter(
      (c) => c.equipe === dadosEquipe.loja.nome
    );
    const totalComissaoLoja = colaboradoresDaLoja.reduce(
      (sum, col) => sum + col.comissaoMes,
      0
    );
    const totalVendidoAnoLoja = colaboradoresDaLoja.reduce(
      (sum, col) => sum + col.metasAnuais.reduce((s, m) => s + m.vendido, 0),
      0
    );
    const totalMetaAnualLoja = colaboradoresDaLoja.reduce(
      (sum, col) => sum + col.metasAnuais.reduce((s, m) => s + m.valorMeta, 0),
      0
    );

    return {
      nomeVisao: `Desempenho: ${dadosEquipe.loja.nome}`,
      totalMetaMensal: dadosEquipe.metaMensal?.valorMeta || 0,
      totalVendido: dadosEquipe.totalVendidoMes,
      percentualGeralMensal: dadosEquipe.metaMensal?.percentual || 0,
      totalComissao: totalComissaoLoja,
      colaboradoresData: colaboradoresDaLoja,
      performancePeriodoSelecionado:
        dashboardData.performancePeriodoSelecionado.filter((p) =>
          colaboradoresDaLoja.some((c) => c.nome.startsWith(p.name))
        ),
      totalVendidoAnual: totalVendidoAnoLoja,
      totalMetaAnual: totalMetaAnualLoja,
      performanceAnual: dashboardData.performanceAnual.filter((p) =>
        colaboradoresDaLoja.some((c) => c.nome.startsWith(p.name))
      ),
    };
  }, [dashboardData, lojaSelecionadaId]);

  if (!dadosVisaoAtual) return <div>Carregando...</div>;

  const {
    nomeVisao,
    totalMetaMensal,
    totalVendido,
    percentualGeralMensal,
    totalComissao,
    colaboradoresData,
    performancePeriodoSelecionado,
    totalMetaAnual,
    totalVendidoAnual,
    performanceAnual,
  } = dadosVisaoAtual;

  const dadosGraficoPizza = {
    meta: totalMetaMensal,
    vendido: totalVendido,
    data: [
      { name: "Vendido", value: totalVendido },
      {
        name: "Faltante p/ Meta",
        value: Math.max(0, totalMetaMensal - totalVendido),
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">{nomeVisao}</p>
        </div>
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-muted-foreground" />
          <Select
            value={lojaSelecionadaId}
            onValueChange={setLojaSelecionadaId}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">
                Visão Geral (Todas as Lojas)
              </SelectItem>
              {lojas.map((loja) => (
                <SelectItem key={loja.id} value={String(loja.id)}>
                  {loja.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {/* Cards de Resumo Mensal */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meta Total (Mês)
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalMetaMensal.toLocaleString()}
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
                  R$ {totalVendido.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {percentualGeralMensal}% da meta
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
                  {colaboradoresData.length}
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
                  R$ {totalComissao.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total previsto</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Desempenho Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Vendedor (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={performancePeriodoSelecionado}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value) => `R$ ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="meta"
                      fill="#a1a1aa"
                      name="Meta"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="vendido"
                      fill="#10b981"
                      name="Vendido"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Gráfico de Progresso Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso da Meta</CardTitle>
                <CardDescription>Desempenho da seleção atual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosGraficoPizza.data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={3}
                      labelLine={false}
                    >
                      {dadosGraficoPizza.data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Vendido"
                              ? PIE_COLORS.vendido
                              : PIE_COLORS.faltante
                          }
                          stroke={
                            entry.name === "Vendido"
                              ? PIE_COLORS.vendido
                              : PIE_COLORS.faltante
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `R$ ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <text
                      x="50%"
                      y="48%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold fill-foreground"
                    >{`${(
                      (dadosGraficoPizza.vendido /
                        (dadosGraficoPizza.meta || 1)) *
                      100
                    ).toFixed(0)}%`}</text>
                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm fill-muted-foreground"
                    >
                      Atingido
                    </text>
                  </PieChart>
                </ResponsiveContainer>
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {colaboradoresData.map((colaborador) => (
                <ColaboradorPerformanceCard
                  key={colaborador.id}
                  colaborador={colaborador}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cards de Resumo Anual */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meta Total (Ano)
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalMetaAnual.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  no ano de {getPeriodLabel().split(" de ")[1]}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Vendido (Ano)
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalVendidoAnual.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalMetaAnual > 0
                    ? `${Math.round(
                        (totalVendidoAnual / totalMetaAnual) * 100
                      )}% da meta`
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Vendedor (Ano)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={performanceAnual}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value) => `R$ ${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="meta"
                    fill="#a1a1aa"
                    name="Meta Anual"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="vendido"
                    fill="#10b981"
                    name="Vendido no Ano"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Individual (Anual)</CardTitle>
              <CardDescription>
                Progresso das metas anuais para o ano de{" "}
                {getPeriodLabel().split(" de ")[1]}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {colaboradoresData
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

      <PeriodComparison />
    </div>
  );
}
