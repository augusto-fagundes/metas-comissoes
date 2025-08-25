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
import { DollarSign, Check, X, Clock, Eye, Archive } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { toast } from "@/hooks/use-toast";
import { Comissao } from "@/data/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Card que aparece condicionalmente para permitir o fechamento do mês.
 */
const MonthClosingCard = () => {
  const { fecharMes } = useData();
  const { getPreviousMonthPeriod } = usePeriodFilter();

  const handleCloseMonth = () => {
    fecharMes();
  };

  const previousMonthLabel = format(
    new Date(`${getPreviousMonthPeriod()}-02`),
    "MMMM 'de' yyyy",
    { locale: ptBR }
  );

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Archive className="w-5 h-5" />
          Fechamento de Mês Disponível
        </CardTitle>
        <CardDescription className="text-amber-800">
          Existem vendas no período de <strong>{previousMonthLabel}</strong> que
          ainda não foram processadas. Gere o fechamento para calcular as
          comissões e enviá-las para aprovação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCloseMonth}>Gerar Fechamento de Mês</Button>
      </CardContent>
    </Card>
  );
};

export function ComissoesPage() {
  const {
    getComissoesBaseadasEmVendas,
    comissoes,
    vendas,
    colaboradores,
    aprovarComissao,
    rejeitarComissao,
    marcarComissaoPaga,
    fecharMes,
  } = useData();
  const {
    getPeriodLabel,
    getPreviousMonthPeriod,
    selectedPeriod,
    filterMode,
    simulationDate,
  } = usePeriodFilter();
  const { user } = useAuth();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedComissao, setSelectedComissao] = useState<Comissao | null>(
    null
  );
  const [observacoes, setObservacoes] = useState("");

  const comissoesVendas = getComissoesBaseadasEmVendas();

  // Lógica para exibir o card de fechamento
  const monthToClose = useMemo(() => {
    const prevMonth = getPreviousMonthPeriod();
    const hasSalesInPrevMonth = vendas.some((v) =>
      v.data.startsWith(prevMonth)
    );
    const isClosed = comissoes.some((c) => c.periodo === prevMonth);
    return hasSalesInPrevMonth && !isClosed ? prevMonth : null;
  }, [vendas, comissoes, getPreviousMonthPeriod]);

  // CORREÇÃO: Lógica ajustada para filtrar corretamente os dados por período
  const allComissionsData = useMemo(() => {
    const periodToFilter =
      filterMode === "live"
        ? format(simulationDate, "yyyy-MM")
        : selectedPeriod;

    // 1. Pega as comissões já processadas (Pendente, Aprovada, etc) APENAS do período selecionado
    const processedInPeriod = comissoes
      .filter((c) => c.periodo === periodToFilter)
      .map((c) => ({
        ...c,
        colaborador: colaboradores.find((col) => col.id === c.colaboradorId),
        isProcessed: true,
        // Adiciona campos que faltam para a tabela funcionar
        quantidadeVendas: c.detalhes.length, // Aproximação, pode ser melhorada
        totalVendido: c.detalhes.reduce((sum, d) => sum + d.valor, 0),
      }));

    // 2. Pega as comissões "Não Processadas" (cálculo em tempo real) do período selecionado
    const notProcessedInPeriod = comissoesVendas.vendasPorColaborador
      // Garante que não vamos mostrar um colaborador que já tem uma comissão processada neste mesmo período
      .filter(
        (v) =>
          !processedInPeriod.some((p) => p.colaboradorId === v.colaborador.id)
      )
      .map((v) => ({
        id: `np-${v.colaborador.id}-${periodToFilter}`,
        colaboradorId: v.colaborador.id,
        colaborador: v.colaborador,
        periodo: periodToFilter,
        valorComissao: v.totalComissao,
        quantidadeVendas: v.quantidadeVendas,
        totalVendido: v.totalVendas,
        status: "nao_processada",
        isProcessed: false,
        detalhes: [], // Não temos detalhes profundos para comissões não processadas
      }));

    // 3. Retorna a combinação dos dois, agora corretamente filtrada
    return [...processedInPeriod, ...notProcessedInPeriod];
  }, [
    comissoes,
    comissoesVendas,
    colaboradores,
    selectedPeriod,
    filterMode,
    simulationDate,
  ]);

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
      case "nao_processada":
        return <Badge variant="outline">Não Processada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReview = (comissao: Comissao) => {
    setSelectedComissao(comissao);
    setObservacoes(comissao.observacoes || "");
    setShowApprovalModal(true);
  };

  const handleApprove = () => {
    if (selectedComissao) {
      aprovarComissao(selectedComissao.id, user!.id, observacoes);
      toast({ title: "Comissão aprovada!" });
      setShowApprovalModal(false);
    }
  };

  const handleReject = () => {
    if (selectedComissao) {
      if (!observacoes.trim()) {
        toast({
          title: "Observação é obrigatória para rejeitar.",
          variant: "destructive",
        });
        return;
      }
      rejeitarComissao(selectedComissao.id, user!.id, observacoes);
      toast({ title: "Comissão rejeitada!" });
      setShowApprovalModal(false);
    }
  };

  const handleMarkAsPaid = (comissaoId: number) => {
    marcarComissaoPaga(comissaoId);
    toast({ title: "Comissão marcada como paga!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comissões</h1>
          <p className="text-gray-600">
            Acompanhe, aprove e gerencie as comissões da equipe.
          </p>
        </div>
      </div>

      {user?.tipo === "admin" && monthToClose && <MonthClosingCard />}

      <FilterBar />

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Aprovação de Comissões</CardTitle>
          <CardDescription>
            Visão geral das comissões {getPeriodLabel()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Total Vendido</TableHead>
                <TableHead>Valor da Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allComissionsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma comissão encontrada para este período.
                  </TableCell>
                </TableRow>
              ) : (
                allComissionsData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={item.colaborador?.foto} />
                          <AvatarFallback>
                            {item.colaborador?.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {item.colaborador?.nome}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.periodo}</TableCell>
                    <TableCell>
                      R${" "}
                      {item.totalVendido?.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      }) ?? "N/A"}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      R${" "}
                      {item.valorComissao.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        {item.status === "pendente" &&
                          user?.tipo === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(item as Comissao)}
                            >
                              Revisar
                            </Button>
                          )}
                        {item.status === "aprovada" &&
                          user?.tipo === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMarkAsPaid(item.id as number)
                              }
                            >
                              Marcar como Paga
                            </Button>
                          )}
                        {item.isProcessed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReview(item as Comissao)}
                          >
                            Detalhes
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedComissao && (
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revisar Comissão</DialogTitle>
              <DialogDescription>
                Analise os detalhes da comissão de{" "}
                <strong>
                  {
                    colaboradores.find(
                      (c) => c.id === selectedComissao.colaboradorId
                    )?.nome
                  }
                </strong>{" "}
                para o período de <strong>{selectedComissao.periodo}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Valor Total da Comissão
                  </Label>
                  <p className="font-bold text-lg text-green-600">
                    R${" "}
                    {selectedComissao.valorComissao.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Status Atual
                  </Label>
                  <div>{getStatusBadge(selectedComissao.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Detalhes por Forma de Pagamento
                </Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Forma</TableHead>
                      <TableHead>Valor Vendido</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedComissao.detalhes.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell>{d.formaPagamento}</TableCell>
                        <TableCell>
                          R${" "}
                          {d.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          R${" "}
                          {d.comissao.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações..."
                  rows={3}
                  disabled={
                    selectedComissao.status !== "pendente" ||
                    user?.tipo !== "admin"
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowApprovalModal(false)}
              >
                Fechar
              </Button>
              {selectedComissao.status === "pendente" &&
                user?.tipo === "admin" && (
                  <>
                    <Button variant="destructive" onClick={handleReject}>
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button onClick={handleApprove}>
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  </>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
