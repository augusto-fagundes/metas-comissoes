"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Target, TrendingUp, Users, DollarSign, Building } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PeriodComparison } from "@/components/period-comparison";

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

const EquipePerformanceCard = ({ equipeData }) => {
  const { loja, colaboradores, totalVendidoMes, metaMensal } = equipeData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          {loja.nome}
        </CardTitle>
        <CardDescription>
          {colaboradores.length} colaboradores na equipe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Total Vendido no Mês</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalVendidoMes.toLocaleString()}
          </p>
        </div>
        {metaMensal && (
          <div>
            <Label>Meta Mensal da Equipe</Label> <br />
            <MetaCard meta={metaMensal} title="Meta da Equipe" />
          </div>
        )}
        {!metaMensal && (
          <div className="text-center text-sm text-muted-foreground p-4 border rounded-md">
            Nenhuma meta mensal definida para esta equipe no período.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PIE_COLORS = {
  vendido: "#3b82f6", // Azul
  faltante: "#e5e7eb", // Cinza
};

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const { getDashboardData, lojas } = useData();
  const { getPeriodLabel } = usePeriodFilter();
  const [equipeSelecionada, setEquipeSelecionada] = useState<string>("todas");

  const dashboardData = getDashboardData();

  // Memoização para recalcular os dados do gráfico de Vendas x Meta
  const dadosGraficoPizza = useMemo(() => {
    if (!dashboardData) return { data: [], totalMeta: 0, totalVendido: 0 };

    let meta = 0;
    let vendido = 0;
    let nome = "Desempenho Geral";

    if (equipeSelecionada === "todas") {
      meta = dashboardData.totalMetaMensal;
      vendido = dashboardData.totalVendido;
    } else {
      const idEquipe = parseInt(equipeSelecionada, 10);
      const dadosEquipe = dashboardData.desempenhoPorEquipe.find(
        (e) => e.loja.id === idEquipe
      );
      if (dadosEquipe) {
        meta = dadosEquipe.metaMensal?.valorMeta || 0;
        vendido = dadosEquipe.totalVendidoMes;
        nome = dadosEquipe.loja.nome;
      }
    }

    const faltante = Math.max(0, meta - vendido);

    const data = [{ name: "Vendido", value: vendido }];

    if (faltante > 0) {
      data.push({ name: "Faltante p/ Meta", value: faltante });
    }

    return { data, totalMeta: meta, totalVendido: vendido, nome };
  }, [dashboardData, equipeSelecionada]);

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Visão Mensal</TabsTrigger>
          <TabsTrigger value="team">Visão por Equipe</TabsTrigger>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GRÁFICO 1: Desempenho por Vendedor (Meta vs Vendido) */}
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Vendedor (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dashboardData.performancePeriodoSelecionado}
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
            {/* GRÁFICO 2: Vendas x Meta Geral (com filtro) */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Progresso da Meta</CardTitle>
                  <Select
                    value={equipeSelecionada}
                    onValueChange={setEquipeSelecionada}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Equipes</SelectItem>
                      {lojas.map((loja) => (
                        <SelectItem key={loja.id} value={String(loja.id)}>
                          {loja.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>{dadosGraficoPizza.nome}</CardDescription>
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
                    {/* Texto no centro do gráfico */}
                    <text
                      x="50%"
                      y="48%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold fill-foreground"
                    >
                      {`${(
                        (dadosGraficoPizza.totalVendido /
                          (dadosGraficoPizza.totalMeta || 1)) *
                        100
                      ).toFixed(0)}%`}
                    </text>
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

        <TabsContent value="team" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Equipe</CardTitle>
              <CardDescription>
                Performance agregada de cada equipe no período selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dashboardData.desempenhoPorEquipe.map((equipeData) => (
                <EquipePerformanceCard
                  key={equipeData.loja.id}
                  equipeData={equipeData}
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

      <PeriodComparison />
    </div>
  );
}
