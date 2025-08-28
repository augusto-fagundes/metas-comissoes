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
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Target, TrendingUp, Users, DollarSign, Store } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format } from "date-fns"; // Adicionado: importação da função 'format'

const getStatusColorClass = (percentual: number) => {
  if (percentual >= 100) return "text-green-500";
  if (percentual >= 80) return "text-yellow-500";
  return "text-red-500";
};

// Componente para exibir o perfil e as metas de um colaborador
const ColaboradorPerformanceCard = ({ colaborador }: { colaborador: any }) => {
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
              .map((n: string) => n[0])
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

const CHART_COLORS = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ef4444"];

export function DashboardPage() {
  const { getDashboardData, lojas, colaboradores, vendas, metas } = useData();
  const { getPeriodLabel, selectedPeriod, filterMode, simulationDate } =
    usePeriodFilter();
  const [lojaSelecionadaId, setLojaSelecionadaId] = useState<string>("todas");
  const [annualView, setAnnualView] = useState("geral"); // 'geral' ou 'timeline'
  const [vendedorSelecionado, setVendedorSelecionado] =
    useState<string>("todos");

  const dashboardData = getDashboardData();

  const dadosVisaoAtual = useMemo(() => {
    if (!dashboardData) return null;

    const periodToFilter =
      filterMode === "live"
        ? format(simulationDate, "yyyy-MM")
        : selectedPeriod;
    const yearToFilter = periodToFilter.substring(0, 4);

    if (lojaSelecionadaId === "todas") {
      return {
        nomeVisao: "Visão Geral (Todas as Lojas)",
        ...dashboardData,
        totalMetaAnual: dashboardData.totalMetaAnual,
        totalVendidoAnual: dashboardData.totalVendidoAnual,
      };
    }

    const idLoja = parseInt(lojaSelecionadaId, 10);
    const dadosEquipe = dashboardData.desempenhoPorEquipe.find(
      (e: any) => e.loja.id === idLoja
    );
    if (!dadosEquipe) return null;

    const colaboradoresDaLoja = colaboradores.filter(
      (c: any) => c.lojaId === idLoja
    );
    const idsColaboradoresDaLoja = colaboradoresDaLoja.map((c) => c.id);

    // Calcular métricas para a loja selecionada
    const totalVendidoMesLoja = vendas
      .filter(
        (v) =>
          idsColaboradoresDaLoja.includes(v.colaboradorId) &&
          v.data.startsWith(periodToFilter)
      )
      .reduce((sum, v) => sum + v.valor, 0);
    const totalComissaoLoja = colaboradoresDaLoja.reduce(
      (sum, col) =>
        sum +
          dashboardData.colaboradoresData.find((d) => d.id === col.id)
            ?.comissaoMes || 0,
      0
    );
    const totalMetaMensalLoja = metas
      .filter(
        (m) =>
          idsColaboradoresDaLoja.includes(m.colaboradorId || 0) &&
          m.periodo === periodToFilter
      )
      .reduce((sum, m) => sum + m.valorMeta, 0);

    const totalVendidoAnoLoja = vendas
      .filter(
        (v) =>
          idsColaboradoresDaLoja.includes(v.colaboradorId) &&
          v.data.startsWith(yearToFilter)
      )
      .reduce((sum, v) => sum + v.valor, 0);
    const totalMetaAnualLoja = metas
      .filter(
        (m) =>
          idsColaboradoresDaLoja.includes(m.colaboradorId || 0) &&
          m.periodo === yearToFilter &&
          m.tipo === "anual"
      )
      .reduce((sum, m) => sum + m.valorMeta, 0);

    return {
      nomeVisao: `Desempenho: ${dadosEquipe.loja.nome}`,
      totalMetaMensal: totalMetaMensalLoja,
      totalVendido: totalVendidoMesLoja,
      percentualGeralMensal:
        totalMetaMensalLoja > 0
          ? Math.round((totalVendidoMesLoja / totalMetaMensalLoja) * 100)
          : 0,
      totalComissao: totalComissaoLoja,
      colaboradoresData: dashboardData.colaboradoresData.filter((d) =>
        idsColaboradoresDaLoja.includes(d.id)
      ),
      performancePeriodoSelecionado:
        dashboardData.performancePeriodoSelecionado.filter((p) =>
          colaboradoresDaLoja.some((c) => c.nome.startsWith(p.name))
        ),
      totalVendidoAnual: totalVendidoAnoLoja,
      totalMetaAnual: totalMetaAnualLoja,
      performanceAnual: dashboardData.performanceAnual.filter((p) =>
        colaboradoresDaLoja.some((c) => c.nome.startsWith(p.name))
      ),
      performanceMensalNoAno: dashboardData.performanceMensalNoAno
        .map((mes) => {
          const novoMes: any = { name: mes.name };
          colaboradoresDaLoja.forEach((col) => {
            const nomeCurto = col.nome.split(" ")[0];
            if (mes[nomeCurto]) {
              novoMes[nomeCurto] = mes[nomeCurto];
            }
          });
          return novoMes;
        })
        .filter((mes) => Object.keys(mes).length > 1), // Filtra meses sem dados
    };
  }, [
    dashboardData,
    lojaSelecionadaId,
    colaboradores,
    vendas,
    metas,
    filterMode,
    selectedPeriod,
    simulationDate,
  ]);

  // Lógica para filtrar o gráfico de timeline anual por vendedor
  const performanceMensalAnualFiltrada = useMemo(() => {
    if (vendedorSelecionado === "todos") {
      return dadosVisaoAtual?.performanceMensalNoAno;
    }
    const nomeCurto = colaboradores
      .find((c) => c.id === parseInt(vendedorSelecionado))
      ?.nome.split(" ")[0];
    if (!nomeCurto) {
      return [];
    }
    return dadosVisaoAtual?.performanceMensalNoAno.map((mes: any) => {
      const novoMes: any = { name: mes.name };
      if (mes[nomeCurto]) {
        novoMes[nomeCurto] = mes[nomeCurto];
      }
      return novoMes;
    });
  }, [dadosVisaoAtual, vendedorSelecionado, colaboradores]);

  // Lógica para obter os vendedores com dados na timeline
  const colaboradoresParaTimeline = useMemo(() => {
    if (vendedorSelecionado === "todos") {
      if (!dadosVisaoAtual?.performanceMensalNoAno) return [];
      const colaboradoresSet = new Set<string>();
      dadosVisaoAtual.performanceMensalNoAno.forEach((mes: any) => {
        Object.keys(mes).forEach((key) => {
          if (key !== "name") {
            colaboradoresSet.add(key);
          }
        });
      });
      return Array.from(colaboradoresSet);
    }
    return [
      colaboradores
        .find((c) => c.id === parseInt(vendedorSelecionado))
        ?.nome.split(" ")[0] || "",
    ];
  }, [dadosVisaoAtual, vendedorSelecionado, colaboradores]);

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
    performanceMensalNoAno,
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

  const isMetaAnualDefined = totalMetaAnual > 0;

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
              {colaboradoresData.map((colaborador: any) => (
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meta Total (Ano)
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalMetaAnual > 0
                    ? `R$ ${totalMetaAnual.toLocaleString()}`
                    : "N/A"}
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
                    : "Sem meta definida"}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Desempenho por Vendedor (Ano)</CardTitle>
              <div className="flex items-center gap-2">
                <Label>Vendedor:</Label>
                <Select
                  value={vendedorSelecionado}
                  onValueChange={setVendedorSelecionado}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {colaboradores.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ToggleGroup
                type="single"
                value={annualView}
                onValueChange={(value) => {
                  if (value) setAnnualView(value);
                }}
                size="sm"
              >
                <ToggleGroupItem value="geral">Visão Geral</ToggleGroupItem>
                <ToggleGroupItem value="timeline">
                  Timeline Mensal
                </ToggleGroupItem>
              </ToggleGroup>
            </CardHeader>
            <CardContent>
              {annualView === "geral" ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={performanceAnual}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
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
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={performanceMensalAnualFiltrada}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value) => `R$ ${value.toLocaleString()}`}
                    />
                    <Legend />
                    {colaboradoresParaTimeline.map((colaborador, index) => (
                      <Bar
                        key={colaborador}
                        dataKey={colaborador}
                        stackId="a"
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        name={colaborador}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
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
              {colaboradoresData.map((colaborador: any) => (
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
