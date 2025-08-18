"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface PeriodFilterContextType {
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  customStartDate: string
  setCustomStartDate: (date: string) => void
  customEndDate: string
  setCustomEndDate: (date: string) => void
  isDateInSelectedPeriod: (date: string) => boolean
  getSelectedPeriodLabel: () => string
  clearFilters: () => void
}

const PeriodFilterContext = createContext<PeriodFilterContextType | undefined>(undefined)

export function PeriodFilterProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const isDateInSelectedPeriod = (date: string): boolean => {
    // Para este exemplo, sempre retorna true para mostrar todas as vendas
    return true
  }

  const getSelectedPeriodLabel = (): string => {
    const [year, month] = selectedPeriod.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  const clearFilters = () => {
    setSelectedPeriod("2024-01")
    setCustomStartDate("")
    setCustomEndDate("")
  }

  return (
    <PeriodFilterContext.Provider
      value={{
        selectedPeriod,
        setSelectedPeriod,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        isDateInSelectedPeriod,
        getSelectedPeriodLabel,
        clearFilters,
      }}
    >
      {children}
    </PeriodFilterContext.Provider>
  )
}

export function usePeriodFilter() {
  const context = useContext(PeriodFilterContext)
  if (context === undefined) {
    throw new Error("usePeriodFilter must be used within a PeriodFilterProvider")
  }
  return context
}
