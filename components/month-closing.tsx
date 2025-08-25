"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Archive, Repeat } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MonthClosing() {
  const {
    vendas,
    metas,
    comissoes,
    fecharMes,
    colaboradores,
    formasPagamento,
  } = useData();
  const { getPreviousMonthPeriod, setFilterMode, setSelectedPeriod } =
    usePeriodFilter();
  const [open, setOpen] = useState(false);

  // Lógica para determinar se existe um mês anterior com vendas que ainda não foi fechado.
  const monthToClose = useMemo(() => {
    const prevMonth = getPreviousMonthPeriod();
    if (!prevMonth) return null;

    const hasSalesInPrevMonth = vendas.some((v) =>
      v.data.startsWith(prevMonth)
    );
    const isAlreadyClosed = comissoes.some((c) => c.periodo === prevMonth);

    return hasSalesInPrevMonth && !isAlreadyClosed ? prevMonth : null;
  }, [vendas, comissoes, getPreviousMonthPeriod]);

  // Calcula os dados de resumo para o modal apenas quando necessário.
  const closingData = useMemo(() => {
    if (!monthToClose) return null;

    const vendasDoPeriodo = vendas.filter((v) =>
      v.data.startsWith(monthToClose)
    );
    const totalVendido = vendasDoPeriodo.reduce((sum, v) => sum + v.valor, 0);

    const comissoesGeradas = colaboradores
      .map((col) => {
        const vendasColaborador = vendasDoPeriodo.filter(
          (v) => v.colaboradorId === col.id
        );
        if (vendasColaborador.length === 0) return null;
        const valorComissao = vendasColaborador.reduce((sum, venda) => {
          const forma = formasPagamento.find(
            (f) => f.codigo === venda.formaPagamento
          );
          return (
            sum + (forma ? (venda.valor * forma.percentualComissao) / 100 : 0)
          );
        }, 0);
        return { nome: col.nome, valor: valorComissao };
      })
      .filter((v) => v && v.valor > 0);

    const totalComissoes = comissoesGeradas.reduce(
      (sum, c) => sum + (c?.valor ?? 0),
      0
    );

    const metasRecorrentes = metas.filter(
      (m) =>
        m.periodo === monthToClose &&
        m.status === "ativa" &&
        m.recorrente &&
        m.tipo === "mensal"
    );

    return { totalVendido, comissoesGeradas, totalComissoes, metasRecorrentes };
  }, [monthToClose, vendas, metas, colaboradores, formasPagamento]);

  // Função que executa o fechamento e redireciona a visão.
  const handleConfirmClosing = () => {
    const previousMonthPeriod = getPreviousMonthPeriod();
    fecharMes();
    setFilterMode("period");
    setSelectedPeriod(previousMonthPeriod);
    setOpen(false); // Fecha o modal após a confirmação
  };

  // Se não há mês para fechar, o componente não renderiza nada.
  if (!monthToClose || !closingData) {
    return null;
  }

  const periodLabel = format(new Date(`${monthToClose}-15`), "MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Archive className="w-4 h-4 mr-2" />
          Fechar Mês ({periodLabel})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-6 h-6 text-amber-600" />
            Confirmar Fechamento de Mês
          </DialogTitle>
          <DialogDescription>
            Você está prestes a fechar o período de{" "}
            <strong>{periodLabel}</strong>. Esta ação é irreversível e irá gerar
            as comissões pendentes e renovar as metas recorrentes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Vendido</p>
                <p className="text-2xl font-bold text-green-600">
                  R${" "}
                  {closingData.totalVendido.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total de Comissões a Gerar
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  R${" "}
                  {closingData.totalComissoes.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {closingData.metasRecorrentes.length > 0 && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Metas Recorrentes a Renovar
              </Label>
              <Table className="mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closingData.metasRecorrentes.map((meta) => (
                    <TableRow key={meta.id}>
                      <TableCell>
                        {
                          colaboradores.find((c) => c.id === meta.colaboradorId)
                            ?.nome
                        }
                      </TableCell>
                      <TableCell>{meta.descricao}</TableCell>
                      <TableCell className="text-right">
                        R$ {meta.valorMeta.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleConfirmClosing}>Confirmar e Fechar Mês</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
