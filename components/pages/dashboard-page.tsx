"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Target, TrendingUp, Users, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { FilterBar } from "@/components/filter-bar"
import { usePeriodFilter } from "@/contexts/period-filter-context"

export function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { getDashboardData } = useData()
  const { getSelectedPeriodLabel } = usePeriodFilter()

  const dashboardData = getDashboardData()
  const periodLabel = getSelectedPeriodLabel()

  // Filtrar dados para colaborador
  const colaboradorData = isAdmin()
    ? null
    : dashboardData.colaboradoresData.find((col) => col.id === user?.colaboradorId)

  const chartData = isAdmin()
    ? dashboardData.colaboradoresData.map((col) => ({
        nome: col.nome.split(" ")[0],
        meta: col.meta,
        vendido: col.vendido,
        percentual: col.percentual,
      }))
    : colaboradorData
      ? [
          {
            nome: colaboradorData.nome.split(" ")[0],
            meta: colaboradorData.meta,
            vendido: colaboradorData.vendido,
            percentual: colaboradorData.percentual,
          },
        ]
      : []

  const pieData = isAdmin()
    ? [
        { name: "Meta Atingida", value: dashboardData.totalVendido, color: "#10b981" },
        {
          name: "Meta Restante",
          value: Math.max(0, dashboardData.totalMeta - dashboardData.totalVendido),
          color: "#e5e7eb",
        },
      ]
    : colaboradorData
      ? [
          { name: "Meta Atingida", value: colaboradorData.vendido, color: "#10b981" },
          {
            name: "Meta Restante",
            value: Math.max(0, colaboradorData.meta - colaboradorData.vendido),
            color: "#e5e7eb",
          },
        ]
      : []

  const COLORS = ["#10b981", "#e5e7eb"]

  const getStatusColor = (percentual: number) => {
    if (percentual >= 100) return "bg-green-500"
    if (percentual >= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (!isAdmin() && colaboradorData) {
    // Dashboard do Colaborador
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Meta</h1>
          <p className="text-gray-600">Acompanhe seu desempenho e progresso</p>
        </div>

        <FilterBar />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-blue-800 mb-1">Período: {periodLabel}</h2>
          <p className="text-sm text-blue-600">Os dados abaixo refletem seu desempenho no período selecionado.</p>
        </div>

        {/* Cards de Métricas do Colaborador */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minha Meta</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {colaboradorData.meta.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Meta do período</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendido</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {colaboradorData.vendido.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{colaboradorData.percentual}% da meta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ {colaboradorData.comissao.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Comissão atual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{colaboradorData.percentual}%</div>
              <p className="text-xs text-muted-foreground">Da meta atingida</p>
            </CardContent>
          </Card>
        </div>

        {/* Perfil do Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Informações da sua meta atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(colaboradorData.percentual)}`}></div>
              <Avatar className="h-16 w-16">
                <AvatarImage src={colaboradorData.foto || "/placeholder.svg"} alt={colaboradorData.nome} />
                <AvatarFallback>
                  {colaboradorData.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-xl">{colaboradorData.nome}</div>
                <div className="text-sm text-gray-500 mb-2">
                  {colaboradorData.cargo} • {colaboradorData.equipe}
                </div>
                <div className="text-sm text-gray-600 mb-4">{colaboradorData.descricaoMeta}</div>
                <div className="w-full">
                  <Progress value={colaboradorData.percentual} className="h-3" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>R$ {colaboradorData.vendido.toLocaleString()}</span>
                    <span>R$ {colaboradorData.meta.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos do Colaborador */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Meu Progresso</CardTitle>
              <CardDescription>Evolução da minha meta no período: {periodLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                  <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
                  <Bar dataKey="vendido" fill="#10b981" name="Vendido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da Meta</CardTitle>
              <CardDescription>Percentual de cumprimento no período: {periodLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <div className="text-3xl font-bold text-green-600">{colaboradorData.percentual}%</div>
                <div className="text-sm text-muted-foreground">Meta Cumprida</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard do Administrador
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Visão geral do desempenho da equipe</p>
      </div>

      <FilterBar />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-blue-800 mb-1">Período: {periodLabel}</h2>
        <p className="text-sm text-blue-600">
          Os dados abaixo refletem o desempenho da equipe no período selecionado.
          {dashboardData.filteredVendas.length === 0 && " Nenhuma venda encontrada para este período."}
        </p>
      </div>

      {/* Cards de Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {dashboardData.totalMeta.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Período: {periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {dashboardData.totalVendido.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.percentualGeral}% da meta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.colaboradoresData.length}</div>
            <p className="text-xs text-muted-foreground">Ativos no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ {dashboardData.totalComissao.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total previsto</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Colaborador</CardTitle>
            <CardDescription>Comparativo entre meta e resultado no período: {periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
                <Bar dataKey="vendido" fill="#10b981" name="Vendido" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
            <CardDescription>Percentual de cumprimento da meta no período: {periodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-3xl font-bold text-green-600">{dashboardData.percentualGeral}%</div>
              <div className="text-sm text-muted-foreground">Meta Cumprida</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Status por Colaborador</CardTitle>
          <CardDescription>Performance individual da equipe no período: {periodLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.colaboradoresData.map((colaborador) => (
              <div
                key={colaborador.id}
                className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(colaborador.percentual)}`}></div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={colaborador.foto || "/placeholder.svg"} alt={colaborador.nome} />
                    <AvatarFallback>
                      {colaborador.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-lg">{colaborador.nome}</div>
                    <div className="text-sm text-gray-500">
                      {colaborador.cargo} • {colaborador.equipe}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 max-w-md">{colaborador.descricaoMeta}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium">R$ {colaborador.vendido.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">de R$ {colaborador.meta.toLocaleString()}</div>
                  </div>

                  <div className="w-24">
                    <Progress value={colaborador.percentual} className="h-2" />
                    <div className="text-xs text-center mt-1">{colaborador.percentual}%</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">R$ {colaborador.comissao.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Comissão</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
