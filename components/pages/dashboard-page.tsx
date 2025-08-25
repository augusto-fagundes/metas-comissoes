"use client";

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
} from "recharts";
import { Target, TrendingUp, Users, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { getDashboardData } = useData();
  const { getPeriodLabel } = usePeriodFilter();

  const dashboardData = getDashboardData();
  const periodLabel = getPeriodLabel();

  const colaboradorData = isAdmin()
    ? null
    : dashboardData.colaboradoresData.find(
        (col) => col.id === user?.colaboradorId
      );

  // O chartData precisa ser ajustado para a nova estrutura de metas
  const chartData = isAdmin()
    ? dashboardData.colaboradoresData.map((col) => {
        const totalMeta = col.metas.reduce(
          (sum, meta) => sum + meta.valorMeta,
          0
        );
        return {
          nome: col.nome.split(" ")[0],
          meta: totalMeta,
          vendido: col.vendido,
          percentual:
            totalMeta > 0 ? Math.round((col.vendido / totalMeta) * 100) : 0,
        };
      })
    : colaboradorData
    ? (() => {
        const totalMeta = colaboradorData.metas.reduce(
          (sum, meta) => sum + meta.valorMeta,
          0
        );
        return [
          {
            nome: colaboradorData.nome.split(" ")[0],
            meta: totalMeta,
            vendido: colaboradorData.vendido,
            percentual:
              totalMeta > 0
                ? Math.round((colaboradorData.vendido / totalMeta) * 100)
                : 0,
          },
        ];
      })()
    : [];

  const getStatusColor = (percentual: number) => {
    if (percentual >= 100) return "bg-green-500";
    if (percentual >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  // --- DASHBOARD DO COLABORADOR ---
  if (!isAdmin() && colaboradorData) {
    const totalMetaColaborador = colaboradorData.metas.reduce(
      (sum, meta) => sum + meta.valorMeta,
      0
    );
    const percentualColaborador =
      totalMetaColaborador > 0
        ? Math.round((colaboradorData.vendido / totalMetaColaborador) * 100)
        : 0;
    const descricoesMetas = colaboradorData.metas
      .map((m) => m.descricao)
      .join("; ");

    const pieDataColaborador = [
      { name: "Atingido", value: colaboradorData.vendido, color: "#10b981" },
      {
        name: "Restante",
        value: Math.max(0, totalMetaColaborador - colaboradorData.vendido),
        color: "#e5e7eb",
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Meta</h1>
          <p className="text-gray-600">Acompanhe seu desempenho e progresso</p>
        </div>
        <FilterBar />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Minha Meta Total
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalMetaColaborador.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Soma das metas no período
              </p>
            </CardContent>
          </Card>
          {/* ... outros cards ... */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
              <div
                className={`w-4 h-4 rounded-full ${getStatusColor(
                  percentualColaborador
                )}`}
              ></div>
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={colaboradorData.foto || "/placeholder.svg"}
                  alt={colaboradorData.nome}
                />
                <AvatarFallback>
                  {colaboradorData.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-xl">
                  {colaboradorData.nome}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {colaboradorData.cargo} • {colaboradorData.equipe}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {descricoesMetas}
                </div>
                <div className="w-full">
                  <Progress value={percentualColaborador} className="h-3" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>R$ {colaboradorData.vendido.toLocaleString()}</span>
                    <span>R$ {totalMetaColaborador.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* ... restante da UI do colaborador ... */}
      </div>
    );
  }

  // --- DASHBOARD DO ADMINISTRADOR ---
  const pieDataAdmin = [
    {
      name: "Total Vendido",
      value: dashboardData.totalVendido,
      color: "#10b981",
    },
    {
      name: "Meta Restante",
      value: Math.max(0, dashboardData.totalMeta - dashboardData.totalVendido),
      color: "#e5e7eb",
    },
  ];
  const COLORS = ["#10b981", "#e5e7eb"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Visão geral do desempenho da equipe</p>
      </div>
      <FilterBar />
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-blue-800 mb-1">
          Exibindo dados {periodLabel}
        </h2>
        <p className="text-sm text-blue-600">
          {dashboardData.filteredVendas.length === 0 &&
            "Nenhuma venda encontrada para este período."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... cards de resumo do admin ... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Colaborador</CardTitle>
            <CardDescription>
              Comparativo entre meta e resultado no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${value.toLocaleString()}`}
                />
                <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
                <Bar dataKey="vendido" fill="#10b981" name="Vendido" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral da Equipe</CardTitle>
            <CardDescription>
              Percentual de cumprimento da meta total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieDataAdmin}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieDataAdmin.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `R$ ${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-3xl font-bold text-green-600">
                {dashboardData.percentualGeral}%
              </div>
              <div className="text-sm text-muted-foreground">Meta Cumprida</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status por Colaborador</CardTitle>
          <CardDescription>
            Performance individual da equipe no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.colaboradoresData.map((colaborador) => {
              const totalMetaColaborador = colaborador.metas.reduce(
                (sum, meta) => sum + meta.valorMeta,
                0
              );
              const percentualColaborador =
                totalMetaColaborador > 0
                  ? Math.round(
                      (colaborador.vendido / totalMetaColaborador) * 100
                    )
                  : 0;
              const descricoesMetas = colaborador.metas
                .map((m) => m.descricao)
                .join("; ");

              return (
                <div
                  key={colaborador.id}
                  className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        percentualColaborador
                      )}`}
                    ></div>
                    <Avatar className="h-12 w-12">
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
                    <div>
                      <div className="font-medium text-lg">
                        {colaborador.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {colaborador.cargo} • {colaborador.equipe}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 max-w-md">
                        {descricoesMetas}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        R$ {colaborador.vendido.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        de R$ {totalMetaColaborador.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-24">
                      <Progress value={percentualColaborador} className="h-2" />
                      <div className="text-xs text-center mt-1">
                        {percentualColaborador}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        R$ {colaborador.comissao.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Comissão</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
