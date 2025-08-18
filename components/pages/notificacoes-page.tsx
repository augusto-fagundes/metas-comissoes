"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react"

export function NotificacoesPage() {
  const notificacoes = [
    {
      id: 1,
      tipo: "alerta",
      titulo: "Meta não atingida",
      mensagem: "João Silva está com apenas 75% da meta do mês",
      data: "2024-01-30",
      lida: false,
    },
    {
      id: 2,
      tipo: "sucesso",
      titulo: "Meta superada",
      mensagem: "Maria Santos atingiu 105% da meta mensal",
      data: "2024-01-29",
      lida: true,
    },
  ]

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "alerta":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "aviso":
        return <Info className="w-4 h-4 text-yellow-500" />
      case "sucesso":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-blue-500" />
    }
  }

  const getTipoBadge = (tipo: string) => {
    const configs = {
      alerta: { className: "bg-red-100 text-red-800", label: "Alerta" },
      aviso: { className: "bg-yellow-100 text-yellow-800", label: "Aviso" },
      sucesso: { className: "bg-green-100 text-green-800", label: "Sucesso" },
    }

    const config = configs[tipo] || { className: "bg-blue-100 text-blue-800", label: tipo }

    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notificações</h1>
        <p className="text-gray-600">Acompanhe alertas e atualizações do sistema</p>
      </div>

      <div className="space-y-4">
        {notificacoes.map((notificacao) => (
          <Card key={notificacao.id} className={!notificacao.lida ? "border-blue-200 bg-blue-50" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTipoIcon(notificacao.tipo)}
                  <CardTitle className="text-lg">{notificacao.titulo}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getTipoBadge(notificacao.tipo)}
                  {!notificacao.lida && <Badge className="bg-blue-100 text-blue-800">Nova</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-2">{notificacao.mensagem}</CardDescription>
              <p className="text-sm text-gray-500">
                {new Date(notificacao.data).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
