"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type FilterMode = "live" | "range" | "period";

interface PeriodFilterContextType {
  // Data simulada que controla todo o sistema
  simulationDate: Date;
  setSimulationDate: (date: Date) => void;

  // Controles de filtro
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;

  // Funções utilitárias
  isDateInPeriod: (date: string) => boolean;
  getPeriodLabel: () => string;
  getPreviousMonthPeriod: () => string;
}

const PeriodFilterContext = createContext<PeriodFilterContextType | undefined>(
  undefined
);

export function PeriodFilterProvider({ children }: { children: ReactNode }) {
  const [simulationDate, setSimulationDate] = useState(
    new Date("2025-08-01T12:00:00")
  );
  const [filterMode, setFilterMode] = useState<FilterMode>("live");
  const [selectedPeriod, setSelectedPeriod] = useState("2025-08"); // É bom atualizar o período inicial também
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const getLivePeriod = () => format(simulationDate, "yyyy-MM");

  const isDateInPeriod = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const currentPeriod =
      filterMode === "live" ? getLivePeriod() : selectedPeriod;
    const date = new Date(`${dateStr}T12:00:00`);

    if (filterMode === "live" || filterMode === "period") {
      // Para metas anuais, comparamos apenas o ano
      if (dateStr.length === 4) {
        // é um ano, ex: "2024"
        return dateStr === currentPeriod.substring(0, 4);
      }
      return dateStr.startsWith(currentPeriod);
    }
    if (filterMode === "range" && dateRange?.from) {
      const from = startOfMonth(dateRange.from);
      const to = dateRange.to ?? from;
      return date >= from && date <= to;
    }
    return false;
  };

  const getPeriodLabel = (): string => {
    const currentPeriod =
      filterMode === "live" ? getLivePeriod() : selectedPeriod;
    if (filterMode === "live" || filterMode === "period") {
      const [year, month] = currentPeriod.split("-");
      const date = new Date(Number(year), Number(month) - 1);
      const label = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      return `de ${label.charAt(0).toUpperCase() + label.slice(1)}`;
    }
    if (filterMode === "range" && dateRange?.from) {
      return `de ${format(dateRange.from, "dd/MM/y")} à ${format(
        dateRange.to ?? dateRange.from,
        "dd/MM/y"
      )}`;
    }
    return "sem período selecionado";
  };

  const getPreviousMonthPeriod = () => {
    const previousMonth = subMonths(simulationDate, 1);
    return format(previousMonth, "yyyy-MM");
  };

  return (
    <PeriodFilterContext.Provider
      value={{
        simulationDate,
        setSimulationDate,
        filterMode,
        setFilterMode,
        selectedPeriod,
        setSelectedPeriod,
        dateRange,
        setDateRange,
        isDateInPeriod,
        getPeriodLabel,
        getPreviousMonthPeriod,
      }}
    >
      {children}
    </PeriodFilterContext.Provider>
  );
}

export function usePeriodFilter() {
  const context = useContext(PeriodFilterContext);
  if (context === undefined) {
    throw new Error(
      "usePeriodFilter must be used within a PeriodFilterProvider"
    );
  }
  return context;
}
