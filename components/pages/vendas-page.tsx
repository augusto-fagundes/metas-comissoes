"use client";

import React, { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ArrowUpDown,
  FilterX,
  ChevronDown,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { ImportVendas } from "@/components/import-vendas";
import { Venda } from "@/data/mock-data";

type SortKey = keyof Venda | "colaboradorNome" | "comissao";
type SortDirection = "ascending" | "descending";

export function VendasPage() {
  const {
    vendas,
    colaboradores,
    lojas,
    formasPagamento,
    addVenda,
    updateVenda,
    deleteVenda,
  } = useData();
  const { user, isAdmin } = useAuth();

  const [showAddVendaDialog, setShowAddVendaDialog] = useState(false);
  const [showImportView, setShowImportView] = useState(false);
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [formData, setFormData] = useState({
    colaboradorId: "",
    cliente: "",
    valor: "",
    data: "",
    formaPagamento: "",
  });

  // Estados para filtros e ordenação
  const [filterLoja, setFilterLoja] = useState<string>("");
  // ALTERAÇÃO: 'filterColaborador' agora é um array de strings (IDs)
  const [filterColaborador, setFilterColaborador] = useState<string[]>([]);
  const [filterFormaPagamento, setFilterFormaPagamento] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>({ key: "data", direction: "descending" });

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

  const handleEdit = (venda: Venda) => {
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

  const colaboradoresFiltradosPorLoja = useMemo(() => {
    if (!filterLoja) return colaboradores;
    return colaboradores.filter((c) => c.lojaId === parseInt(filterLoja));
  }, [filterLoja, colaboradores]);

  const resetFilters = () => {
    setFilterLoja("");
    setFilterColaborador([]); // Reseta para um array vazio
    setFilterFormaPagamento("");
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredVendas = useMemo(() => {
    let items: any[] = isAdmin()
      ? vendas
      : vendas.filter((v) => v.colaboradorId === user?.colaboradorId);

    items = items.map((venda) => {
      const colaborador = colaboradores.find(
        (c) => c.id === venda.colaboradorId
      );
      return {
        ...venda,
        colaboradorNome: colaborador?.nome || "",
        lojaId: colaborador?.lojaId,
        comissao: calcularComissao(venda.valor, venda.formaPagamento),
      };
    });

    if (filterLoja) {
      items = items.filter((item) => item.lojaId === parseInt(filterLoja));
    }
    // ALTERAÇÃO: A lógica agora verifica se o ID está INCLUÍDO no array de filtros
    if (filterColaborador.length > 0) {
      items = items.filter((item) =>
        filterColaborador.includes(item.colaboradorId.toString())
      );
    }
    if (filterFormaPagamento) {
      items = items.filter(
        (item) => item.formaPagamento === filterFormaPagamento
      );
    }

    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return items;
  }, [
    vendas,
    user,
    isAdmin,
    filterLoja,
    filterColaborador,
    filterFormaPagamento,
    sortConfig,
    colaboradores,
  ]);

  const totalVendas = sortedAndFilteredVendas.reduce(
    (sum, v) => sum + v.valor,
    0
  );
  const totalComissoes = sortedAndFilteredVendas.reduce(
    (sum, v) => sum + v.comissao,
    0
  );
  const ticketMedio =
    sortedAndFilteredVendas.length > 0
      ? totalVendas / sortedAndFilteredVendas.length
      : 0;

  const SortableHeader = ({
    sortKey,
    children,
    className,
  }: {
    sortKey: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={() => requestSort(sortKey)}
        className="px-2"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-gray-600">
            Gerencie e analise todas as vendas realizadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin() && (
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Filtradas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedAndFilteredVendas.length}
            </div>
            <p className="text-xs text-muted-foreground">vendas encontradas</p>
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

      {showImportView && (
        <ImportVendas onClose={() => setShowImportView(false)} />
      )}

      {isAdmin() && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Ordenação</CardTitle>
            <CardDescription>
              Refine sua busca para analisar os dados de vendas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Equipe:</Label>
              <Select value={filterLoja} onValueChange={setFilterLoja}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as Equipes" />
                </SelectTrigger>
                <SelectContent>
                  {lojas.map((loja) => (
                    <SelectItem key={loja.id} value={loja.id.toString()}>
                      {loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Vendedor:</Label>
              {/* NOVO COMPONENTE DE MULTI-SELEÇÃO */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-48 justify-between">
                    {filterColaborador.length === 0 && "Todos os Vendedores"}
                    {filterColaborador.length === 1 &&
                      colaboradores.find(
                        (c) => c.id.toString() === filterColaborador[0]
                      )?.nome}
                    {filterColaborador.length > 1 &&
                      `${filterColaborador.length} vendedores selecionados`}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Vendedores da Equipe</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {colaboradoresFiltradosPorLoja.map((colaborador) => (
                    <DropdownMenuCheckboxItem
                      key={colaborador.id}
                      checked={filterColaborador.includes(
                        colaborador.id.toString()
                      )}
                      onCheckedChange={(checked) => {
                        return checked
                          ? setFilterColaborador([
                              ...filterColaborador,
                              colaborador.id.toString(),
                            ])
                          : setFilterColaborador(
                              filterColaborador.filter(
                                (id) => id !== colaborador.id.toString()
                              )
                            );
                      }}
                    >
                      {colaborador.nome}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <Label>Pagamento:</Label>
              <Select
                value={filterFormaPagamento}
                onValueChange={setFilterFormaPagamento}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as Formas" />
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
            <Button variant="ghost" onClick={resetFilters}>
              <FilterX className="w-4 h-4 mr-2" /> Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader sortKey="id">ID</SortableHeader>
                {isAdmin() && (
                  <SortableHeader sortKey="colaboradorNome">
                    Colaborador
                  </SortableHeader>
                )}
                <TableHead>Cliente</TableHead>
                <SortableHeader sortKey="valor">Valor</SortableHeader>
                <SortableHeader sortKey="data">Data</SortableHeader>
                <TableHead>Pagamento</TableHead>
                <SortableHeader sortKey="comissao">Comissão</SortableHeader>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredVendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-medium">#{venda.id}</TableCell>
                  {isAdmin() && <TableCell>{venda.colaboradorNome}</TableCell>}
                  <TableCell>{venda.cliente}</TableCell>
                  <TableCell>
                    R${" "}
                    {venda.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(`${venda.data}T12:00:00`).toLocaleDateString(
                      "pt-BR"
                    )}
                  </TableCell>
                  <TableCell>{venda.formaPagamento}</TableCell>
                  <TableCell>
                    R${" "}
                    {venda.comissao.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(venda.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddVendaDialog} onOpenChange={setShowAddVendaDialog}>
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
    </div>
  );
}
