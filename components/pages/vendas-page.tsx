"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  TrendingUp,
  Users,
  DollarSign,
  Upload,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
// ALTERAÇÃO 1: Importamos o novo componente de importação em tela
import { ImportVendas } from "@/components/import-vendas";

export function VendasPage() {
  const {
    vendas,
    colaboradores,
    formasPagamento,
    addVenda,
    updateVenda,
    deleteVenda,
  } = useData();
  const { user, isAdmin } = useAuth();

  const [showAddVendaDialog, setShowAddVendaDialog] = useState(false);

  // ALTERAÇÃO 2: Este estado controla a visibilidade da interface de importação
  const [showImportView, setShowImportView] = useState(false);

  const [editingVenda, setEditingVenda] = useState<any>(null);
  const [formData, setFormData] = useState({
    colaboradorId: "",
    cliente: "",
    valor: "",
    data: "",
    formaPagamento: "",
  });

  const resetForm = () => {
    setFormData({
      colaboradorId: isAdmin() ? "" : user?.colaboradorId?.toString() || "",
      cliente: "",
      valor: "",
      data: "",
      formaPagamento: "",
    });
    setEditingVenda(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendaData = {
      colaboradorId: Number(formData.colaboradorId),
      cliente: formData.cliente,
      valor: parseFloat(formData.valor),
      data: formData.data,
      formaPagamento: formData.formaPagamento,
      status: "confirmada" as const,
    };
    if (editingVenda) {
      updateVenda({ ...editingVenda, ...vendaData });
      toast({
        title: "Venda atualizada!",
        description: "A venda foi atualizada com sucesso.",
      });
    } else {
      addVenda(vendaData);
      toast({
        title: "Venda registrada!",
        description: "Nova venda foi adicionada com sucesso.",
      });
    }
    setShowAddVendaDialog(false);
    resetForm();
  };

  const handleEdit = (venda: any) => {
    setEditingVenda(venda);
    setFormData({
      colaboradorId: venda.colaboradorId.toString(),
      cliente: venda.cliente,
      valor: venda.valor.toString(),
      data: venda.data,
      formaPagamento: venda.formaPagamento,
    });
    setShowAddVendaDialog(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta venda?")) {
      deleteVenda(id);
      toast({
        title: "Venda excluída!",
        description: "A venda foi removida do sistema.",
      });
    }
  };

  const getColaboradorNome = (id: number) =>
    colaboradores.find((c) => c.id === id)?.nome || "N/A";
  const getFormaPagamentoPercentual = (codigo: string) =>
    formasPagamento.find((f) => f.codigo === codigo)?.percentualComissao || 0;
  const calcularComissao = (valor: number, formaPagamento: string) =>
    (valor * getFormaPagamentoPercentual(formaPagamento)) / 100;
  const getStatusBadge = (status: string) =>
    status === "confirmada" ? (
      <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
    );

  const vendasFiltradas = isAdmin()
    ? vendas
    : vendas.filter((v) => v.colaboradorId === user?.colaboradorId);
  const totalVendas = vendasFiltradas.reduce((sum, v) => sum + v.valor, 0);
  const totalComissoes = vendasFiltradas.reduce(
    (sum, v) => sum + calcularComissao(v.valor, v.formaPagamento),
    0
  );
  const ticketMedio =
    vendasFiltradas.length > 0 ? totalVendas / vendasFiltradas.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-gray-600">Gerencie todas as vendas realizadas</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin() && (
            // ALTERAÇÃO 3: O botão agora alterna a visualização do componente de importação
            <Button
              variant="outline"
              onClick={() => setShowImportView(!showImportView)}
            >
              <Upload className="w-4 h-4 mr-2" />
              {showImportView ? "Fechar Importação" : "Importar"}
            </Button>
          )}
          <Button
            onClick={() => {
              resetForm();
              setShowAddVendaDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Os Cards de estatísticas permanecem aqui, inalterados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendasFiltradas.length}</div>
            <p className="text-xs text-muted-foreground">vendas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R${" "}
              {totalVendas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              em vendas realizadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {ticketMedio.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">por venda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comissões
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R${" "}
              {totalComissoes.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              em comissões geradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ALTERAÇÃO 4: Renderização condicional do componente de importação */}
      {showImportView && (
        <ImportVendas onClose={() => setShowImportView(false)} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                {isAdmin() && <TableHead>Colaborador</TableHead>}
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasFiltradas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-medium">#{venda.id}</TableCell>
                  {isAdmin() && (
                    <TableCell>
                      {getColaboradorNome(venda.colaboradorId)}
                    </TableCell>
                  )}
                  <TableCell>{venda.cliente}</TableCell>
                  <TableCell>
                    R${" "}
                    {venda.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(venda.data).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}
                  </TableCell>
                  <TableCell>{venda.formaPagamento}</TableCell>
                  <TableCell>
                    R${" "}
                    {calcularComissao(
                      venda.valor,
                      venda.formaPagamento
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{getStatusBadge(venda.status)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(venda)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(venda.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddVendaDialog} onOpenChange={setShowAddVendaDialog}>
        {/* O Dialog de Adicionar/Editar Venda permanece inalterado */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVenda ? "Editar Venda" : "Nova Venda"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {isAdmin() && (
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
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) =>
                    setFormData({ ...formData, cliente: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data da Venda</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value) =>
                    setFormData({ ...formData, formaPagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map((f) => (
                      <SelectItem key={f.id} value={f.codigo}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddVendaDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingVenda ? "Atualizar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALTERAÇÃO 5: O antigo ImportDialog foi removido daqui */}
    </div>
  );
}
