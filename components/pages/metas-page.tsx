"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Target, TrendingUp, Users, Info } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { toast } from "@/hooks/use-toast"

export function MetasPage() {
  const { metas, colaboradores, formasPagamento, addMeta, updateMeta, deleteMeta } = useData()
  const [showDialog, setShowDialog] = useState(false)
  const [editingMeta, setEditingMeta] = useState(null)
  const [formData, setFormData] = useState({
    colaboradorId: "",
    periodo: "",
    valorMeta: "",
    descricao: "",
  })

  const resetForm = () => {
    setFormData({
      colaboradorId: "",
      periodo: "",
      valorMeta: "",
      descricao: "",
    })
    setEditingMeta(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const metaData = {
      colaboradorId: Number.parseInt(formData.colaboradorId),
      periodo: formData.periodo,
      valorMeta: Number.parseFloat(formData.valorMeta),
      descricao: formData.descricao,
      status: "ativa" as const,
    }

    if (editingMeta) {
      updateMeta({
        ...editingMeta,
        ...metaData,
      })
      toast({
        title: "Meta atualizada!",
        description: "A meta foi atualizada com sucesso.",
      })
    } else {
      addMeta(metaData)
      toast({
        title: "Meta criada!",
        description: "Nova meta foi definida com sucesso.",
      })
    }

    setShowDialog(false)
    resetForm()
  }

  const handleEdit = (meta) => {
    setEditingMeta(meta)
    setFormData({
      colaboradorId: meta.colaboradorId.toString(),
      periodo: meta.periodo,
      valorMeta: meta.valorMeta.toString(),
      descricao: meta.descricao,
    })
    setShowDialog(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      deleteMeta(id)
      toast({
        title: "Meta excluída!",
        description: "A meta foi removida do sistema.",
      })
    }
  }

  const getColaboradorNome = (colaboradorId: number) => {
    const colaborador = colaboradores.find((c) => c.id === colaboradorId)
    return colaborador?.nome || "Colaborador não encontrado"
  }

  const getStatusBadge = (status: string) => {
    return status === "ativa" ? (
      <Badge className="bg-green-100 text-green-800">Ativa</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inativa</Badge>
    )
  }

  const metasAtivas = metas.filter((m) => m.status === "ativa")
  const totalMetasValor = metasAtivas.reduce((sum, meta) => sum + meta.valorMeta, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Metas</h1>
          <p className="text-gray-600">Defina e acompanhe as metas de vendas</p>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMeta ? "Editar Meta" : "Nova Meta"}</DialogTitle>
              <DialogDescription>
                {editingMeta ? "Atualize as informações da meta" : "Defina uma nova meta para o colaborador"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="colaboradorId">Colaborador</Label>
                <Select
                  value={formData.colaboradorId}
                  onValueChange={(value) => setFormData({ ...formData, colaboradorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((colaborador) => (
                      <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                        {colaborador.nome} - {colaborador.equipe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Input
                    id="periodo"
                    type="month"
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorMeta">Valor da Meta (R$)</Label>
                  <Input
                    id="valorMeta"
                    type="number"
                    step="0.01"
                    value={formData.valorMeta}
                    onChange={(e) => setFormData({ ...formData, valorMeta: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva os objetivos e detalhes da meta..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingMeta ? "Atualizar" : "Criar Meta"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Card Informativo sobre Comissões */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="w-5 h-5" />
            Como as Comissões são Calculadas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="mb-3">
            As comissões são calculadas automaticamente com base no{" "}
            <strong>percentual de cada forma de pagamento</strong> sobre o valor da venda:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {formasPagamento.map((forma) => (
              <div key={forma.id} className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="font-medium">{forma.nome}</span>
                <Badge variant="outline" className="text-blue-600">
                  {forma.percentualComissao}%
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm">
            <strong>Exemplo:</strong> Uma venda de R$ 10.000 via PIX gera R$ 600 de comissão (6% × R$ 10.000)
          </p>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metasAtivas.length}</div>
            <p className="text-xs text-muted-foreground">de {metas.length} metas totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalMetasValor.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">em metas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(metasAtivas.map((m) => m.colaboradorId)).size}</div>
            <p className="text-xs text-muted-foreground">com metas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Meta</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metasAtivas.length > 0 ? Math.round(totalMetasValor / metasAtivas.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">valor médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Metas</CardTitle>
          <CardDescription>Gerencie todas as metas definidas para a equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Valor da Meta</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {getColaboradorNome(meta.colaboradorId)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{getColaboradorNome(meta.colaboradorId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(meta.periodo + "-01").toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">R$ {meta.valorMeta.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={meta.descricao}>
                      {meta.descricao}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(meta.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(meta)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(meta.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
