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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Archive, Repeat, User, ShoppingCart } from "lucide-react";
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
    setComissoes,
    setMetas,
  } = useData();
  const { getPreviousMonthPeriod, setFilterMode, setSelectedPeriod } =
    usePeriodFilter();
  const [open, setOpen] = useState(false);

  const monthToClose = useMemo(() => {
    const prevMonth = getPreviousMonthPeriod();
    if (!prevMonth) return null;

    const hasSalesInPrevMonth = vendas.some((v) =>
      v.data.startsWith(prevMonth)
    );
    const isAlreadyClosed = comissoes.some((c) => c.periodo === prevMonth);

    return hasSalesInPrevMonth && !isAlreadyClosed ? prevMonth : null;
  }, [vendas, comissoes, getPreviousMonthPeriod]);

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

        const totalVendidoColaborador = vendasColaborador.reduce(
          (sum, v) => sum + v.valor,
          0
        );

        const valorComissao = vendasColaborador.reduce((sum, venda) => {
          const forma = formasPagamento.find(
            (f) => f.codigo === venda.formaPagamento
          );
          return (
            sum + (forma ? (venda.valor * forma.percentualComissao) / 100 : 0)
          );
        }, 0);

        return {
          nome: col.nome,
          totalVendido: totalVendidoColaborador,
          valorComissao,
          vendas: vendasColaborador,
        };
      })
      .filter(
        (v): v is NonNullable<typeof v> => v !== null && v.valorComissao > 0
      );

    const totalComissoes = comissoesGeradas.reduce(
      (sum, c) => sum + (c?.valorComissao ?? 0),
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

  const handleConfirmClosing = () => {
    const previousMonthPeriod = getPreviousMonthPeriod();
    const { novasComissoes, metasAtualizadas } = fecharMes();

    setComissoes(novasComissoes);
    setMetas(metasAtualizadas);

    setFilterMode("period");
    setSelectedPeriod(previousMonthPeriod);
    setOpen(false);
  };

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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-6 h-6 text-amber-600" />
            Confirmar Fechamento de Mês
          </DialogTitle>
          <DialogDescription>
            Você está prestes a fechar o período de{" "}
            <strong>{periodLabel}</strong>. Esta ação é irreversível.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Geral do Mês</CardTitle>
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

          <div>
            <Label className="text-base font-medium flex items-center gap-2 mb-2">
              <User className="w-5 h-5" />
              Resumo por Vendedor
            </Label>
            <Accordion type="single" collapsible className="w-full">
              {closingData.comissoesGeradas.map((colData, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 text-sm font-medium">
                      <span>{colData.nome}</span>
                      <div className="flex gap-6">
                        <span>
                          Vendido:{" "}
                          <strong className="font-bold text-green-700">
                            R${" "}
                            {colData.totalVendido.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>
                        </span>
                        <span>
                          Comissão:{" "}
                          <strong className="font-bold text-blue-700">
                            R${" "}
                            {colData.valorComissao.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Vendas Realizadas
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {colData.vendas.map((venda) => (
                          <TableRow key={venda.id}>
                            <TableCell>
                              {format(
                                new Date(`${venda.data}T12:00:00`),
                                "dd/MM/yyyy"
                              )}
                            </TableCell>
                            <TableCell>{venda.cliente}</TableCell>
                            <TableCell className="text-right">
                              R${" "}
                              {venda.valor.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {closingData.metasRecorrentes.length > 0 && (
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Metas Recorrentes a Renovar
              </Label>
              <div className="mt-2 border rounded-md p-4">
                {closingData.metasRecorrentes.map((meta) => (
                  <div key={meta.id} className="text-sm text-muted-foreground">
                    - A meta de{" "}
                    <strong>R$ {meta.valorMeta.toLocaleString()}</strong> para{" "}
                    <strong>
                      {
                        colaboradores.find((c) => c.id === meta.colaboradorId)
                          ?.nome
                      }
                    </strong>{" "}
                    será recriada para o próximo mês.
                  </div>
                ))}
              </div>
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
