"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Target, TrendingUp, Users } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { toast } from "@/hooks/use-toast";
import { CommissionInfoPanel } from "@/components/commission-info-panel";
import { Meta } from "@/data/mock-data";

export function MetasPage() {
  const { metas, colaboradores, addMeta, updateMeta, deleteMeta } = useData();
  const [showDialog, setShowDialog] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);

  const [formData, setFormData] = useState({
    colaboradorId: "",
    periodo: "",
    valorMeta: "",
    descricao: "",
    tipo: "mensal" as "mensal" | "anual",
    recorrente: false,
  });

  const resetForm = () => {
    setFormData({
      colaboradorId: "",
      periodo: "",
      valorMeta: "",
      descricao: "",
      tipo: "mensal",
      recorrente: false,
    });
    setEditingMeta(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const metaData = {
      colaboradorId: Number.parseInt(formData.colaboradorId),
      periodo: formData.periodo,
      valorMeta: Number.parseFloat(formData.valorMeta),
      descricao: formData.descricao,
      tipo: formData.tipo,
      recorrente: formData.tipo === "mensal" ? formData.recorrente : false,
      status: "ativa" as const,
    };

    if (editingMeta) {
      updateMeta({ ...editingMeta, ...metaData });
      toast({ title: "Meta atualizada!" });
    } else {
      addMeta(metaData);
      toast({ title: "Meta criada!" });
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta);
    setFormData({
      colaboradorId: meta.colaboradorId.toString(),
      periodo: meta.periodo,
      valorMeta: meta.valorMeta.toString(),
      descricao: meta.descricao,
      tipo: meta.tipo,
      recorrente: meta.recorrente,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      deleteMeta(id);
      toast({ title: "Meta excluída!" });
    }
  };

  const getColaboradorNome = (colaboradorId: number) => {
    return colaboradores.find((c) => c.id === colaboradorId)?.nome || "N/A";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativa":
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case "concluida":
        return <Badge className="bg-gray-100 text-gray-800">Concluída</Badge>;
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const metasAtivas = metas.filter((m) => m.status === "ativa");
  const totalMetasValor = metasAtivas.reduce(
    (sum, meta) => sum + meta.valorMeta,
    0
  );

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
              <DialogTitle>
                {editingMeta ? "Editar Meta" : "Nova Meta"}
              </DialogTitle>
              <DialogDescription>
                Defina os detalhes da meta para um colaborador.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="colaboradorId">Colaborador</Label>
                <Select
                  value={formData.colaboradorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, colaboradorId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Meta</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        tipo: value as any,
                        periodo: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Input
                    id="periodo"
                    type={formData.tipo === "mensal" ? "month" : "number"}
                    placeholder={formData.tipo === "anual" ? "YYYY" : ""}
                    value={formData.periodo}
                    onChange={(e) =>
                      setFormData({ ...formData, periodo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMeta">Valor da Meta (R$)</Label>
                <Input
                  id="valorMeta"
                  type="number"
                  step="0.01"
                  value={formData.valorMeta}
                  onChange={(e) =>
                    setFormData({ ...formData, valorMeta: e.target.value })
                  }
                  required
                />
              </div>

              {formData.tipo === "mensal" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recorrente"
                    checked={formData.recorrente}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, recorrente: checked })
                    }
                  />
                  <Label htmlFor="recorrente">
                    Esta é uma meta mensal recorrente?
                  </Label>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Descreva os objetivos da meta..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMeta ? "Atualizar Meta" : "Criar Meta"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metasAtivas.length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {metas.length} metas totais
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total em Metas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalMetasValor.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">em metas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Colaboradores com Meta
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(metasAtivas.map((m) => m.colaboradorId)).size}
            </div>
            <p className="text-xs text-muted-foreground">com metas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média por Meta
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {metasAtivas.length > 0
                ? Math.round(
                    totalMetasValor / metasAtivas.length
                  ).toLocaleString()
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">valor médio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Metas</CardTitle>
          <CardDescription>
            Gerencie todas as metas definidas para a equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor da Meta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell className="font-medium">
                    {getColaboradorNome(meta.colaboradorId)}
                  </TableCell>
                  <TableCell>{meta.periodo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {meta.tipo}
                      {meta.recorrente ? " (R)" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {meta.valorMeta.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(meta.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(meta)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(meta.id)}
                      >
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
      <CommissionInfoPanel />
    </div>
  );
}
