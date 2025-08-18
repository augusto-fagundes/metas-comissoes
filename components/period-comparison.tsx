"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useData } from "@/contexts/data-context"

export function PeriodComparison() {
  const { vendas } = useData()

  // Calcular dados do mês atual
  const hoje = new Date()
  const mesAtual = hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0")
  const mesPassado = hoje.getFullYear() + "-" + String(hoje.getMonth()).padStart(2, "0")

  const vendasMesAtual = vendas.filter((v) => v.status === "confirmada" && v.data.startsWith(mesAtual))
  const vendasMesPassado = vendas.filter((v) => v.status === "confirmada" && v.data.startsWith(mesPassado))

  const totalMesAtual = vendasMesAtual.reduce((sum, v) => sum + v.valor, 0)
  const totalMesPassado = vendasMesPassado.reduce((sum, v) => sum + v.valor, 0)

  const quantidadeMesAtual = vendasMesAtual.length
  const quantidadeMesPassado = vendasMesPassado.length

  const ticketMedioAtual = quantidadeMesAtual > 0 ? totalMesAtual / quantidadeMesAtual : 0
  const ticketMedioPassado = quantidadeMesPassado > 0 ? totalMesPassado / quantidadeMesPassado : 0

  // Calcular variações percentuais
  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return atual > 0 ? 100 : 0
    return ((atual - anterior) / anterior) * 100
  }

  const variacaoTotal = calcularVariacao(totalMesAtual, totalMesPassado)
  const variacaoQuantidade = calcularVariacao(quantidadeMesAtual, quantidadeMesPassado)
  const variacaoTicket = calcularVariacao(ticketMedioAtual, ticketMedioPassado)

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (variacao < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getVariacaoBadge = (variacao: number) => {
    const className =
      variacao > 0
        ? "bg-green-100 text-green-800"
        : variacao < 0
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"

    const sinal = variacao > 0 ? "+" : ""
    return (
      <Badge className={className}>
        {sinal}
        {variacao.toFixed(1)}%
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação com Período Anterior</CardTitle>
        <CardDescription>
          Comparativo entre {hoje.toLocaleDateString("pt-BR", { month: "long" })} e{" "}
          {new Date(hoje.getFullYear(), hoje.getMonth() - 1).toLocaleDateString("pt-BR", { month: "long" })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total de Vendas</span>
              {getVariacaoIcon(variacaoTotal)}
            </div>
            <div className="text-2xl font-bold">R$ {totalMesAtual.toLocaleString()}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Anterior: R$ {totalMesPassado.toLocaleString()}</span>
              {getVariacaoBadge(variacaoTotal)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantidade de Vendas</span>
              {getVariacaoIcon(variacaoQuantidade)}
            </div>
            <div className="text-2xl font-bold">{quantidadeMesAtual}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Anterior: {quantidadeMesPassado}</span>
              {getVariacaoBadge(variacaoQuantidade)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ticket Médio</span>
              {getVariacaoIcon(variacaoTicket)}
            </div>
            <div className="text-2xl font-bold">R$ {ticketMedioAtual.toLocaleString()}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Anterior: R$ {ticketMedioPassado.toLocaleString()}</span>
              {getVariacaoBadge(variacaoTicket)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
