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
import { DollarSign, Check, X, Clock, Eye } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { FilterBar } from "@/components/filter-bar";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { toast } from "@/hooks/use-toast";
import { Comissao } from "@/data/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// O componente de fechamento foi movido para seu próprio arquivo, então o removemos daqui.

export function ComissoesPage() {
  const {
    getComissoesBaseadasEmVendas,
    comissoes,
    vendas,
    colaboradores,
    aprovarComissao,
    rejeitarComissao,
    marcarComissaoPaga,
  } = useData();
  const { getPeriodLabel, selectedPeriod, filterMode, simulationDate } =
    usePeriodFilter();
  const { user } = useAuth();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [observacoes, setObservacoes] = useState("");

  const comissoesVendas = getComissoesBaseadasEmVendas();

  const allComissionsData = useMemo(() => {
    const periodToFilter =
      filterMode === "live"
        ? format(simulationDate, "yyyy-MM")
        : selectedPeriod;

    const processedInPeriod = comissoes
      .filter((c) => c.periodo === periodToFilter)
      .map((c) => {
        const vendasColaborador = vendas.filter(
          (v) =>
            v.colaboradorId === c.colaboradorId && v.data.startsWith(c.periodo)
        );
        return {
          ...c,
          colaborador: colaboradores.find((col) => col.id === c.colaboradorId),
          isProcessed: true,
          quantidadeVendas: vendasColaborador.length,
          totalVendido: vendasColaborador.reduce((sum, v) => sum + v.valor, 0),
          vendas: vendasColaborador,
        };
      });

    const notProcessedInPeriod = (comissoesVendas.vendasPorColaborador || [])
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
        detalhes: v.detalhesFormasPagamento,
        vendas: v.vendas,
      }));

    return [...processedInPeriod, ...notProcessedInPeriod];
  }, [
    comissoes,
    comissoesVendas,
    colaboradores,
    selectedPeriod,
    filterMode,
    simulationDate,
    vendas,
  ]);

  const handleOpenModal = (data: any) => {
    setModalData(data);
    setObservacoes(data.observacoes || "");
    setShowApprovalModal(true);
  };

  const handleApprove = () => {
    if (modalData) {
      aprovarComissao(modalData.id, user!.id, observacoes);
      toast({ title: "Comissão aprovada!" });
      setShowApprovalModal(false);
    }
  };

  const handleReject = () => {
    if (modalData) {
      if (!observacoes.trim()) {
        toast({
          title: "Observação é obrigatória para rejeitar.",
          variant: "destructive",
        });
        return;
      }
      rejeitarComissao(modalData.id, user!.id, observacoes);
      toast({ title: "Comissão rejeitada!" });
      setShowApprovalModal(false);
    }
  };

  const handleMarkAsPaid = (comissaoId: number) => {
    marcarComissaoPaga(comissaoId);
    toast({ title: "Comissão marcada como paga!" });
  };

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

      {/* O card e a lógica de fechamento foram movidos para a FilterBar */}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(item)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Detalhes
                        </Button>
                        {item.status === "pendente" &&
                          user?.tipo === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(item)}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {modalData && (
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Comissão</DialogTitle>
              <DialogDescription>
                Analise os detalhes da comissão de{" "}
                <strong>{modalData.colaborador.nome}</strong> para o período de{" "}
                <strong>{modalData.periodo}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Valor Total da Comissão
                  </Label>
                  <p className="font-bold text-lg text-green-600">
                    R${" "}
                    {modalData.valorComissao.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Status Atual
                  </Label>
                  <div>{getStatusBadge(modalData.status)}</div>
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
                      <TableHead>Total Vendido</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalData.detalhes.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell>{d.formaPagamento}</TableCell>
                        <TableCell>
                          R${" "}
                          {d.totalVendas?.toLocaleString("pt-BR", {
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
                <Label className="text-sm text-muted-foreground">
                  Vendas Realizadas no Período ({modalData.quantidadeVendas})
                </Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalData.vendas.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          {format(new Date(`${v.data}T12:00:00`), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{v.cliente}</TableCell>
                        <TableCell className="text-right">
                          R${" "}
                          {v.valor.toLocaleString("pt-BR", {
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
                  placeholder="Adicione observações para aprovar ou rejeitar..."
                  rows={3}
                  disabled={
                    modalData.status !== "pendente" || user?.tipo !== "admin"
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApprovalModal(false)}
              >
                Fechar
              </Button>
              {modalData.status === "pendente" && user?.tipo === "admin" && (
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
