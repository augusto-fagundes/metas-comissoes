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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  BarChart2,
  Building,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "../ui/label";

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

const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#eab308",
];

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const { getDashboardData } = useData();
  const { getPeriodLabel, filterMode } = usePeriodFilter();

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
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Vendedor (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.vendasPorVendedor}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={(props) => props.name}
                    >
                      {dashboardData.vendasPorVendedor.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `R$ ${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Forma de Pagamento (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.vendasPorPagamento}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#82ca9d"
                      label
                    >
                      {dashboardData.vendasPorPagamento.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `R$ ${value.toLocaleString()}`}
                    />
                    <Legend />
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

      {filterMode === "period" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Desempenho Comparativo do
              Período
            </CardTitle>
            <CardDescription>
              Meta vs. Vendido para cada vendedor no período de{" "}
              {getPeriodLabel().replace("de ", "")}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dashboardData.performancePeriodoSelecionado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                <Tooltip
                  formatter={(value) => `R$ ${value.toLocaleString()}`}
                />
                <Legend />
                <Bar
                  dataKey="meta"
                  fill="#e5e7eb"
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
      )}
    </div>
  );
}
