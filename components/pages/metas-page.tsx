"use client";

import type React from "react";
import { useState, useMemo } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { FilterBar } from "@/components/filter-bar";

export function MetasPage() {
  const { metas, colaboradores, lojas, addMeta, updateMeta, deleteMeta } =
    useData();
  const { isDateInPeriod, selectedPeriod, filterMode } = usePeriodFilter();

  const [showDialog, setShowDialog] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);

  const [targetType, setTargetType] = useState<"individual" | "equipe">(
    "individual"
  );
  const [formData, setFormData] = useState({
    targetId: "",
    periodo: "",
    valorMeta: "",
    tipo: "mensal" as "mensal" | "anual",
    recorrente: false,
  });

  const [filterTipo, setFilterTipo] = useState<"todos" | "mensal" | "anual">(
    "todos"
  );

  const filteredMetas = useMemo(() => {
    return metas.filter(
      (meta) =>
        isDateInPeriod(meta.periodo) &&
        (filterTipo === "todos" || meta.tipo === filterTipo)
    );
  }, [metas, isDateInPeriod, filterTipo]);

  const resetForm = () => {
    const defaultPeriod =
      filterMode === "period"
        ? selectedPeriod
        : new Date().toISOString().slice(0, 7);
    setFormData({
      targetId: "",
      periodo: defaultPeriod,
      valorMeta: "",
      tipo: "mensal",
      recorrente: false,
    });
    setTargetType("individual");
    setEditingMeta(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const metaData = {
      colaboradorId:
        targetType === "individual" ? Number(formData.targetId) : undefined,
      lojaId: targetType === "equipe" ? Number(formData.targetId) : undefined,
      periodo: formData.periodo,
      valorMeta: Number.parseFloat(formData.valorMeta),
      descricao: "Meta de Vendas",
      tipo: formData.tipo,
      recorrente: formData.tipo === "mensal" ? formData.recorrente : false,
    };

    if (editingMeta) {
      updateMeta({ ...editingMeta, ...metaData, status: editingMeta.status });
      toast({ title: "Meta atualizada!" });
    } else {
      addMeta(metaData as any);
      toast({ title: "Meta criada!" });
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (meta: Meta) => {
    const isEquipe = meta.lojaId != null;
    setTargetType(isEquipe ? "equipe" : "individual");
    setEditingMeta(meta);
    setFormData({
      targetId: (isEquipe ? meta.lojaId : meta.colaboradorId)?.toString() ?? "",
      periodo: meta.periodo,
      valorMeta: meta.valorMeta.toString(),
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

  const getTargetName = (meta: Meta) => {
    if (meta.lojaId) {
      return lojas.find((l) => l.id === meta.lojaId)?.nome || "Equipe N/A";
    }
    if (meta.colaboradorId) {
      return (
        colaboradores.find((c) => c.id === meta.colaboradorId)?.nome ||
        "Colaborador N/A"
      );
    }
    return "N/A";
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
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Esta meta é para:</Label>
                <RadioGroup
                  value={targetType}
                  onValueChange={(value) => {
                    setTargetType(value as any);
                    setFormData((f) => ({ ...f, targetId: "" }));
                  }}
                  className="flex gap-4"
                  disabled={!!editingMeta}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equipe" id="equipe" />
                    <Label htmlFor="equipe">Equipe</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetId">
                  {targetType === "individual" ? "Colaborador" : "Equipe"}
                </Label>
                <Select
                  value={formData.targetId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, targetId: value })
                  }
                  disabled={!!editingMeta}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Selecione ${
                        targetType === "individual"
                          ? "o colaborador"
                          : "a equipe"
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {targetType === "individual"
                      ? colaboradores.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.nome}
                          </SelectItem>
                        ))
                      : lojas.map((l) => (
                          <SelectItem key={l.id} value={l.id.toString()}>
                            {l.nome}
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

      <FilterBar />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Lista de Metas</CardTitle>
            <CardDescription>
              Gerencie todas as metas definidas para o período selecionado
            </CardDescription>
          </div>
          <Select
            value={filterTipo}
            onValueChange={(value) => setFilterTipo(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alvo da Meta</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor da Meta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMetas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma meta encontrada para este período.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMetas.map((meta) => (
                  <TableRow key={meta.id}>
                    <TableCell className="font-medium">
                      {getTargetName(meta)}
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CommissionInfoPanel />
    </div>
  );
}
