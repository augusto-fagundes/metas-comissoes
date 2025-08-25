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
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

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
  Calendar as CalendarIcon,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { ImportVendas } from "@/components/import-vendas";
import { Venda } from "@/data/mock-data";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { FilterBar } from "@/components/filter-bar";

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
  const { isDateInPeriod } = usePeriodFilter();

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

  const [filterLoja, setFilterLoja] = useState<string>("");
  const [filterColaborador, setFilterColaborador] = useState<string[]>([]);
  const [filterFormaPagamento, setFilterFormaPagamento] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
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
    setFilterColaborador([]);
    setFilterFormaPagamento("");
    setDateRange(undefined);
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

    // 1. Filtro Global de Período
    items = items.filter((venda) => isDateInPeriod(venda.data));

    // 2. Filtros Locais da Página
    if (dateRange?.from) {
      items = items.filter((venda) => {
        const vendaDate = new Date(`${venda.data}T12:00:00`);
        const from = dateRange.from!;
        const to = dateRange.to ?? from;
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        return vendaDate >= from && vendaDate <= to;
      });
    }

    if (filterLoja) {
      const colaboradoresNaLoja = colaboradores
        .filter((c) => c.lojaId === parseInt(filterLoja))
        .map((c) => c.id);
      items = items.filter((item) =>
        colaboradoresNaLoja.includes(item.colaboradorId)
      );
    }
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

    // 3. Adiciona dados para ordenação
    items = items.map((venda) => ({
      ...venda,
      colaboradorNome:
        colaboradores.find((c) => c.id === venda.colaboradorId)?.nome || "",
      comissao: calcularComissao(venda.valor, venda.formaPagamento),
    }));

    // 4. Aplica Ordenação
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
    isDateInPeriod,
    dateRange,
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
        {sortConfig?.key === sortKey && (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
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

      <FilterBar />

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
            <CardTitle>Filtros Avançados</CardTitle>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-56 justify-between">
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
                <DropdownMenuContent className="w-56">
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
            <div className="flex items-center gap-2">
              <Label>Período:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className="w-[260px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y", {
                            locale: ptBR,
                          })}{" "}
                          -{" "}
                          {format(dateRange.to, "LLL dd, y", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione um intervalo</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
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
              {sortedAndFilteredVendas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin() ? 9 : 8}
                    className="h-24 text-center"
                  >
                    Nenhuma venda encontrada com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                sortedAndFilteredVendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">#{venda.id}</TableCell>
                    {isAdmin() && (
                      <TableCell>{venda.colaboradorNome}</TableCell>
                    )}
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
                ))
              )}
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
