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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  Plus,
  Trash2,
  GitCompareArrows,
  CalendarIcon,
  DollarSign,
  ShoppingCart,
  Percent,
  TrendingUp,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { DateRange } from "react-day-picker";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Define a estrutura de um item de comparação
interface ComparisonItem {
  id: number;
  type: "vendedor" | "equipe";
  entityId: string;
  periodType: "mes" | "ano" | "personalizado";
  periodValue: string; // "YYYY-MM" para mês, "YYYY" para ano
  dateRange?: DateRange; // Para período personalizado
}

// Define a estrutura dos resultados calculados
interface CalculatedData {
  totalVendido: number;
  numVendas: number;
  ticketMedio: number;
  totalComissoes: number;
}

// Paleta de cores para o gráfico
const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f97316",
  "#8b5cf6",
  "#ef4444",
  "#eab308",
];

export function PeriodComparison() {
  const { vendas, colaboradores, lojas, formasPagamento } = useData();
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);

  // Adiciona uma nova coluna de comparação
  const addItem = () => {
    if (comparisonItems.length >= 6) {
      // Limite de 6 comparações
      alert("Limite de 6 comparações atingido.");
      return;
    }
    const newItem: ComparisonItem = {
      id: Date.now(),
      type: "vendedor",
      entityId: "",
      periodType: "mes",
      periodValue: new Date().toISOString().slice(0, 7),
    };
    setComparisonItems([...comparisonItems, newItem]);
  };

  // Remove uma coluna de comparação
  const removeItem = (id: number) => {
    setComparisonItems(comparisonItems.filter((item) => item.id !== id));
  };

  // Atualiza os dados de uma coluna de comparação
  const updateItem = (id: number, updatedValues: Partial<ComparisonItem>) => {
    setComparisonItems(
      comparisonItems.map((item) =>
        item.id === id ? { ...item, ...updatedValues } : item
      )
    );
  };

  // Calcula os dados para cada item de comparação
  const calculatedResults = useMemo((): Map<number, CalculatedData> => {
    const results = new Map<number, CalculatedData>();
    comparisonItems.forEach((item) => {
      // Regra de validação: só calcula se tiver entidade e período
      if (!item.entityId || (!item.periodValue && !item.dateRange?.from)) {
        results.set(item.id, {
          totalVendido: 0,
          numVendas: 0,
          ticketMedio: 0,
          totalComissoes: 0,
        });
        return;
      }

      let vendasFiltradas = vendas;

      // 1. Filtro por Entidade
      if (item.type === "vendedor") {
        vendasFiltradas = vendasFiltradas.filter(
          (v) => v.colaboradorId === Number(item.entityId)
        );
      } else if (item.type === "equipe") {
        const idsColaboradores = colaboradores
          .filter((c) => c.lojaId === Number(item.entityId))
          .map((c) => c.id);
        vendasFiltradas = vendasFiltradas.filter((v) =>
          idsColaboradores.includes(v.colaboradorId)
        );
      }

      // 2. Filtro por Período
      if (item.periodType === "personalizado" && item.dateRange?.from) {
        vendasFiltradas = vendasFiltradas.filter((v) => {
          const vendaDate = new Date(`${v.data}T12:00:00`);
          const from = item.dateRange!.from!;
          const to = item.dateRange!.to ?? from;
          from.setHours(0, 0, 0, 0);
          to.setHours(23, 59, 59, 999);
          return vendaDate >= from && vendaDate <= to;
        });
      } else {
        vendasFiltradas = vendasFiltradas.filter((v) =>
          v.data.startsWith(item.periodValue)
        );
      }

      const totalVendido = vendasFiltradas.reduce((sum, v) => sum + v.valor, 0);
      const numVendas = vendasFiltradas.length;
      const ticketMedio = numVendas > 0 ? totalVendido / numVendas : 0;
      const totalComissoes = vendasFiltradas.reduce((sum, venda) => {
        const forma = formasPagamento.find(
          (f) => f.codigo === venda.formaPagamento
        );
        const percentual = forma ? forma.percentualComissao : 0;
        return sum + (venda.valor * percentual) / 100;
      }, 0);

      results.set(item.id, {
        totalVendido,
        numVendas,
        ticketMedio,
        totalComissoes,
      });
    });
    return results;
  }, [comparisonItems, vendas, colaboradores, lojas, formasPagamento]);

  // Gera um rótulo descritivo para cada comparação
  const getComparisonLabel = (item: ComparisonItem): string => {
    const entityList = item.type === "vendedor" ? colaboradores : lojas;
    const entity = entityList.find((e) => e.id === Number(item.entityId));
    const entityName = entity ? entity.nome.split(" ")[0] : "...";

    if (item.periodType === "personalizado" && item.dateRange?.from) {
      const start = format(item.dateRange.from, "dd/MM");
      const end = item.dateRange.to ? format(item.dateRange.to, "dd/MM") : "";
      return `${entityName} (${start}${end ? `-${end}` : ""})`;
    }
    if (item.periodType === "ano") {
      return `${entityName} (${item.periodValue})`;
    }
    if (item.periodType === "mes" && item.periodValue) {
      const date = parse(item.periodValue, "yyyy-MM", new Date());
      return `${entityName} (${format(date, "MMM/yy", { locale: ptBR })})`;
    }
    return entityName;
  };

  // Prepara dados para o gráfico e identifica as cores
  const chartData = useMemo(() => {
    const entityColorMap = new Map<string, string>();
    let colorIndex = 0;

    return comparisonItems.map((item) => {
      const label = getComparisonLabel(item);
      if (!entityColorMap.has(item.entityId)) {
        entityColorMap.set(
          item.entityId,
          CHART_COLORS[colorIndex % CHART_COLORS.length]
        );
        colorIndex++;
      }

      return {
        name: label,
        "Total Vendido": calculatedResults.get(item.id)?.totalVendido || 0,
        fill: entityColorMap.get(item.entityId),
      };
    });
  }, [comparisonItems, calculatedResults]);

  // Encontra os maiores valores para destacar na tabela
  const winners = useMemo(() => {
    const maxValues = {
      totalVendido: 0,
      numVendas: 0,
      ticketMedio: 0,
      totalComissoes: 0,
    };
    const winningIds = {
      totalVendido: null,
      numVendas: null,
      ticketMedio: null,
      totalComissoes: null,
    };

    calculatedResults.forEach((data) => {
      if (data.totalVendido > maxValues.totalVendido)
        maxValues.totalVendido = data.totalVendido;
      if (data.numVendas > maxValues.numVendas)
        maxValues.numVendas = data.numVendas;
      if (data.ticketMedio > maxValues.ticketMedio)
        maxValues.ticketMedio = data.ticketMedio;
      if (data.totalComissoes > maxValues.totalComissoes)
        maxValues.totalComissoes = data.totalComissoes;
    });

    calculatedResults.forEach((data, id) => {
      if (
        data.totalVendido === maxValues.totalVendido &&
        maxValues.totalVendido > 0
      )
        winningIds.totalVendido = id;
      if (data.numVendas === maxValues.numVendas && maxValues.numVendas > 0)
        winningIds.numVendas = id;
      if (
        data.ticketMedio === maxValues.ticketMedio &&
        maxValues.ticketMedio > 0
      )
        winningIds.ticketMedio = id;
      if (
        data.totalComissoes === maxValues.totalComissoes &&
        maxValues.totalComissoes > 0
      )
        winningIds.totalComissoes = id;
    });
    return winningIds;
  }, [calculatedResults]);

  const metrics = [
    {
      key: "totalVendido",
      label: "Total Vendido",
      icon: DollarSign,
      isCurrency: true,
      highlightClass: "text-green-600",
    },
    {
      key: "numVendas",
      label: "Nº de Vendas",
      icon: ShoppingCart,
      isCurrency: false,
    },
    {
      key: "ticketMedio",
      label: "Ticket Médio",
      icon: Percent,
      isCurrency: true,
    },
    {
      key: "totalComissoes",
      label: "Total de Comissões",
      icon: TrendingUp,
      isCurrency: true,
      highlightClass: "text-blue-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows /> Painel Comparativo
        </CardTitle>
        <CardDescription>
          Compare o desempenho entre vendedores, equipes e períodos diferentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
          {comparisonItems.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border bg-background rounded-md space-y-3 flex-grow min-w-[320px] shadow-sm"
            >
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Comparação #{index + 1}</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Select
                  value={item.type}
                  onValueChange={(v) =>
                    updateItem(item.id, { type: v as any, entityId: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="equipe">Equipe</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={item.entityId}
                  onValueChange={(v) => updateItem(item.id, { entityId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(item.type === "vendedor" ? colaboradores : lojas).map(
                      (entity) => (
                        <SelectItem key={entity.id} value={String(entity.id)}>
                          {entity.nome}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Select
                  value={item.periodType}
                  onValueChange={(v) =>
                    updateItem(item.id, {
                      periodType: v as any,
                      periodValue: "",
                      dateRange: undefined,
                    })
                  }
                >
                  <SelectTrigger className="w-[150px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes">Mês</SelectItem>
                    <SelectItem value="ano">Ano</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                {item.periodType === "personalizado" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal text-muted-foreground"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.dateRange?.from ? (
                          item.dateRange.to ? (
                            <>
                              {format(item.dateRange.from, "dd/MM/yy")} -{" "}
                              {format(item.dateRange.to, "dd/MM/yy")}
                            </>
                          ) : (
                            format(item.dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={item.dateRange?.from}
                        selected={item.dateRange}
                        onSelect={(range) =>
                          updateItem(item.id, { dateRange: range })
                        }
                        numberOfMonths={1}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    type={item.periodType === "mes" ? "month" : "number"}
                    value={item.periodValue}
                    placeholder={item.periodType === "ano" ? "YYYY" : ""}
                    onChange={(e) =>
                      updateItem(item.id, { periodValue: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center flex-grow min-w-[280px]">
            <Button
              onClick={addItem}
              variant="outline"
              className="h-full w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Comparação
            </Button>
          </div>
        </div>

        {comparisonItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <GitCompareArrows className="mx-auto h-12 w-12" />
            <p className="mt-4">
              Adicione colunas de comparação para começar a analisar os dados.
            </p>
          </div>
        )}

        {comparisonItems.length > 0 && (
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Resultados da Comparação
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-base w-[200px]">
                        Métrica
                      </TableHead>
                      {comparisonItems.map((item) => (
                        <TableHead
                          key={item.id}
                          className="text-center font-semibold text-base"
                        >
                          {getComparisonLabel(item)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric) => (
                      <TableRow key={metric.key}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <metric.icon className="w-4 h-4 text-muted-foreground" />
                          {metric.label}
                        </TableCell>
                        {comparisonItems.map((item) => (
                          <TableCell
                            key={item.id}
                            className={cn(
                              "text-center text-base",
                              item.id ===
                                winners[metric.key as keyof typeof winners] &&
                                "bg-green-50 text-green-700 font-bold",
                              metric.highlightClass
                            )}
                          >
                            {metric.isCurrency && "R$ "}
                            {calculatedResults
                              .get(item.id)
                              ?.[
                                metric.key as keyof CalculatedData
                              ].toLocaleString("pt-BR", {
                                minimumFractionDigits: metric.isCurrency
                                  ? 2
                                  : 0,
                              })}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Visualização Gráfica (Total Vendido)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `R$ ${value.toLocaleString()}`,
                      props.payload.name,
                    ]}
                  />
                  <Bar dataKey="Total Vendido" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
