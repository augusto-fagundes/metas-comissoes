"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { usePeriodFilter } from "@/contexts/period-filter-context"

export function FilterBar() {
  const { selectedPeriod, setSelectedPeriod, getSelectedPeriodLabel } = usePeriodFilter()

  const periods = [
    { value: "2024-01", label: "Janeiro 2024" },
    { value: "2023-12", label: "Dezembro 2023" },
    { value: "2023-11", label: "Novembro 2023" },
    { value: "2023-10", label: "Outubro 2023" },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">Exibindo dados de {getSelectedPeriodLabel()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
