"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import {
  DollarSign,
  CreditCard,
  Percent,
  Check,
  X,
  Clock,
  Eye,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { toast } from "@/hooks/use-toast";

export function ComissoesPage() {
  const {
    getComissoesBaseadasEmVendas,
    formasPagamento,
    comissoes,
    colaboradores,
    usuarios,
    aprovarComissao,
    rejeitarComissao,
    marcarComissaoPaga,
  } = useData();
  const { getSelectedPeriodLabel } = usePeriodFilter();
  const { user } = useAuth();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComissao, setSelectedComissao] = useState(null);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [observacoes, setObservacoes] = useState("");

  const comissoesVendas = getComissoesBaseadasEmVendas();
  const periodLabel = getSelectedPeriodLabel();

  // Dados para o gráfico de barras (comissões por colaborador)
  const chartDataColaboradores = comissoesVendas.vendasPorColaborador.map(
    (col) => ({
      nome: col.colaborador.nome.split(" ")[0],
      comissao: col.totalComissao,
      vendas: col.totalVendas,
    })
  );

  // Dados para o gráfico de pizza (comissões por forma de pagamento)
  const chartDataFormas = comissoesVendas.resumoPorForma.map(
    (forma, index) => ({
      name: forma.formaPagamento,
      value: forma.comissao,
      color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5],
    })
  );

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "aprovada":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Aprovada
          </Badge>
        );
      case "rejeitada":
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Rejeitada
          </Badge>
        );
      case "paga":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <DollarSign className="w-3 h-3 mr-1" />
            Paga
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getColaboradorNome = (colaboradorId: number) => {
    const colaborador = colaboradores.find((c) => c.id === colaboradorId);
    return colaborador?.nome || "Colaborador não encontrado";
  };

  const getUsuarioNome = (usuarioId?: number) => {
    if (!usuarioId) return "N/A";
    const usuario = usuarios.find((u) => u.id === usuarioId);
    return usuario?.nome || "Usuário não encontrado";
  };

  const handleAprovar = () => {
    if (selectedComissao) {
      aprovarComissao(selectedComissao.id, user?.id || 1, observacoes);
      setShowApprovalModal(false);
      setSelectedComissao(null);
      setObservacoes("");

      toast({
        title: "Comissão aprovada!",
        description: "A comissão foi aprovada com sucesso.",
      });
    }
  };

  const handleRejeitar = () => {
    if (selectedComissao && observacoes.trim()) {
      rejeitarComissao(selectedComissao.id, user?.id || 1, observacoes);
      setShowApprovalModal(false);
      setSelectedComissao(null);
      setObservacoes("");

      toast({
        title: "Comissão rejeitada!",
        description: "A comissão foi rejeitada.",
      });
    } else {
      toast({
        title: "Observação obrigatória",
        description:
          "Para rejeitar uma comissão, é necessário informar o motivo.",
        variant: "destructive",
      });
    }
  };

  const handleMarcarPaga = (comissaoId: number) => {
    marcarComissaoPaga(comissaoId);

    toast({
      title: "Comissão marcada como paga!",
      description: "A comissão foi marcada como paga.",
    });
  };

  const handleVerDetalhes = (colaboradorData) => {
    setSelectedColaborador(colaboradorData);
    setShowDetailsModal(true);
  };

  const comissoesPendentes = comissoes.filter((c) => c.status === "pendente");
  const comissoesAprovadas = comissoes.filter((c) => c.status === "aprovada");
  const comissoesPagas = comissoes.filter((c) => c.status === "paga");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comissões</h1>
          <p className="text-gray-600">
            Sistema de aprovação baseado em vendas e formas de pagamento
          </p>
        </div>
      </div>

      <FilterBar />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-blue-800 mb-1">
          Período: {periodLabel}
        </h2>
        <p className="text-sm text-blue-600">
          As comissões são calculadas automaticamente com base no percentual de
          cada forma de pagamento sobre o valor das vendas realizadas.
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Comissões
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {comissoesVendas.totalGeralComissoes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado nas vendas do período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendedores Ativos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {comissoesVendas.vendasPorColaborador.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com vendas no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {comissoesPendentes.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {comissoesAprovadas.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Prontas para pagamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comissões por Colaborador</CardTitle>
            <CardDescription>
              Valor total de comissões baseado nas vendas do período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataColaboradores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${value.toLocaleString()}`}
                />
                <Bar dataKey="comissao" fill="#10b981" name="Comissão" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comissões por Forma de Pagamento</CardTitle>
            <CardDescription>
              Distribuição das comissões por forma de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartDataFormas}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartDataFormas.map((entry, index) => (
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
            <div className="mt-4 space-y-2">
              {chartDataFormas.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-medium">
                    R$ {entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Aprovação de Comissões Baseado em Vendas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            Sistema de Aprovação de Comissões
          </CardTitle>
          <CardDescription>
            Todos os vendedores com vendas no período aparecem automaticamente
            para aprovação de comissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Qtd. Vendas</TableHead>
                <TableHead>Total Vendido</TableHead>
                <TableHead>Valor da Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comissoesVendas.vendasPorColaborador.map((colaboradorData) => {
                // Verificar se existe comissão registrada para este colaborador
                const comissaoExistente = comissoes.find(
                  (c) => c.colaboradorId === colaboradorData.colaborador.id
                );

                return (
                  <TableRow key={colaboradorData.colaborador.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            {colaboradorData.colaborador.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">
                            {colaboradorData.colaborador.nome}
                          </span>
                          <p className="text-xs text-gray-500">
                            {colaboradorData.colaborador.equipe}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {colaboradorData.quantidadeVendas}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        R$ {colaboradorData.totalVendas.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        R$ {colaboradorData.totalComissao.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {comissaoExistente ? (
                        getStatusBadge(comissaoExistente.status)
                      ) : (
                        <Badge variant="outline" className="bg-gray-100">
                          Não processada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerDetalhes(colaboradorData)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                        {comissaoExistente?.status === "pendente" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedComissao(comissaoExistente);
                              setShowApprovalModal(true);
                            }}
                          >
                            Revisar
                          </Button>
                        )}
                        {comissaoExistente?.status === "aprovada" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleMarcarPaga(comissaoExistente.id)
                            }
                          >
                            Marcar como Paga
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumo por Forma de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Resumo por Forma de Pagamento
          </CardTitle>
          <CardDescription>
            Detalhamento das comissões por forma de pagamento no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Percentual</TableHead>
                <TableHead>Quantidade de Vendas</TableHead>
                <TableHead>Total de Vendas</TableHead>
                <TableHead>Total de Comissões</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comissoesVendas.resumoPorForma.map((forma) => (
                <TableRow key={forma.codigo}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{forma.codigo}</Badge>
                      <span className="font-medium">
                        {forma.formaPagamento}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Percent className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {forma.percentualComissao}%
                      </span>
                      <span className="text-sm text-gray-500">
                        sobre cada venda
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{forma.quantidadeVendas}</TableCell>
                  <TableCell>R$ {forma.totalVendas.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      R$ {forma.comissao.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Colaborador */}
      {selectedColaborador && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Detalhes das Vendas e Comissões</DialogTitle>
              <DialogDescription>
                Resumo completo das vendas de{" "}
                {selectedColaborador.colaborador.nome}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Resumo Geral */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedColaborador.quantidadeVendas}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Valor Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {selectedColaborador.totalVendas.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Comissão Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {selectedColaborador.totalComissao.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      R${" "}
                      {(
                        selectedColaborador.totalVendas /
                        selectedColaborador.quantidadeVendas
                      ).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes por Forma de Pagamento */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Detalhamento por Forma de Pagamento
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead>Qtd. Vendas</TableHead>
                      <TableHead>Total Vendido</TableHead>
                      <TableHead>% Comissão</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedColaborador.detalhesFormasPagamento.map(
                      (detalhe, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant="outline">
                              {detalhe.formaPagamento}
                            </Badge>
                          </TableCell>
                          <TableCell>{detalhe.quantidadeVendas}</TableCell>
                          <TableCell>
                            R$ {detalhe.totalVendas.toLocaleString()}
                          </TableCell>
                          <TableCell>{detalhe.percentualComissao}%</TableCell>
                          <TableCell className="font-medium text-green-600">
                            R$ {detalhe.comissao.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Lista de Vendas */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Lista de Vendas</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Forma Pagamento</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedColaborador.vendas.map((venda) => {
                      const forma = formasPagamento.find(
                        (f) => f.codigo === venda.formaPagamento
                      );
                      const comissao =
                        (venda.valor * (forma?.percentualComissao || 0)) / 100;

                      return (
                        <TableRow key={venda.id}>
                          <TableCell>#{venda.id}</TableCell>
                          <TableCell>{venda.cliente}</TableCell>
                          <TableCell>
                            R$ {venda.valor.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(venda.data).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {forma?.nome || venda.formaPagamento}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            R$ {comissao.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Aprovação */}
      {selectedComissao && (
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Revisar Comissão</DialogTitle>
              <DialogDescription>
                Analise os detalhes da comissão de{" "}
                {getColaboradorNome(selectedComissao.colaboradorId)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Informações Gerais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Colaborador</Label>
                  <div className="font-medium">
                    {getColaboradorNome(selectedComissao.colaboradorId)}
                  </div>
                </div>
                <div>
                  <Label>Período</Label>
                  <div className="font-medium">
                    {new Date(
                      selectedComissao.periodo + "-01"
                    ).toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <Label>Valor Total da Comissão</Label>
                  <div className="font-medium text-green-600 text-lg">
                    R$ {selectedComissao.valorComissao.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label>Data do Cálculo</Label>
                  <div className="font-medium">
                    {new Date(selectedComissao.dataCalculo).toLocaleDateString(
                      "pt-BR"
                    )}
                  </div>
                </div>
              </div>

              {/* Detalhes por Forma de Pagamento */}
              <div>
                <Label>Detalhamento por Forma de Pagamento</Label>
                <div className="mt-2 border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Forma de Pagamento</TableHead>
                        <TableHead>Valor das Vendas</TableHead>
                        <TableHead>Percentual</TableHead>
                        <TableHead>Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedComissao.detalhes.map((detalhe, index) => (
                        <TableRow key={index}>
                          <TableCell>{detalhe.formaPagamento}</TableCell>
                          <TableCell>
                            R$ {detalhe.valor.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formasPagamento.find(
                              (f) => f.nome === detalhe.formaPagamento
                            )?.percentualComissao || 0}
                            %
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            R$ {detalhe.comissao.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre esta comissão..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRejeitar}>
                <X className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
              <Button onClick={handleAprovar}>
                <Check className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
