"use client";

import * as React from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Zap,
  History,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { usePeriodFilter } from "@/contexts/period-filter-context";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { MonthClosing } from "@/components/month-closing";

export function FilterBar() {
  const {
    filterMode,
    setFilterMode,
    selectedPeriod,
    setSelectedPeriod,
    simulationDate,
    setSimulationDate,
  } = usePeriodFilter();
  const { vendas, metas } = useData();
  const { isAdmin } = useAuth();

  const periods = React.useMemo(() => {
    const periodSet = new Set<string>();
    vendas.forEach((v) => periodSet.add(v.data.substring(0, 7)));
    metas.forEach((m) => periodSet.add(m.periodo.substring(0, 7)));

    if (periodSet.size === 0) {
      const today = new Date();
      periodSet.add(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
          2,
          "0"
        )}`
      );
    }

    return Array.from(periodSet)
      .sort()
      .reverse()
      .map((p) => {
        const [year, month] = p.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        const label = date.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
        return {
          value: p,
          label: label.charAt(0).toUpperCase() + label.slice(1),
        };
      });
  }, [vendas, metas]);

  return (
    <Card>
      <CardContent className="p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant={filterMode === "live" ? "default" : "outline"}
            onClick={() => setFilterMode("live")}
          >
            <Zap className="w-4 h-4 mr-2" />
            Mês Atual (Corrida)
          </Button>
          <Button
            variant={filterMode === "period" ? "default" : "outline"}
            onClick={() => setFilterMode("period")}
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </Button>

          {filterMode === "period" && (
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isAdmin() && <MonthClosing />}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Data da Simulação:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[260px] justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(simulationDate, "PPP", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={simulationDate}
                onSelect={(date) => date && setSimulationDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setSimulationDate(addDays(simulationDate, 1))}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
