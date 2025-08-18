"use client";

import { useState } from "react";

export function useExcelExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportDashboardData = async (
    dashboardData: any,
    periodLabel: string
  ) => {
    setIsExporting(true);

    try {
      // Simular delay de exportação
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Preparar dados para CSV
      const csvData = dashboardData.colaboradoresData.map((col: any) => ({
        Colaborador: col.nome,
        Equipe: col.equipe,
        Cargo: col.cargo,
        "Meta (R$)": col.meta,
        "Vendido (R$)": col.vendido,
        "Percentual (%)": col.percentual,
        "Comissão (R$)": col.comissao,
        "Quantidade de Vendas": col.vendasCount,
        "Última Venda": col.ultimaVenda || "N/A",
      }));

      // Converter para CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          headers.map((header) => `"${row[header]}"`).join(",")
        ),
      ].join("\n");

      // Download do arquivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `dashboard-${periodLabel.replace(/\s+/g, "-")}-${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error("Erro ao exportar:", error);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const exportVendasData = async (vendas: any[], periodLabel: string) => {
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const csvData = vendas.map((venda: any) => ({
        ID: venda.id,
        Colaborador: venda.colaboradorNome || "N/A",
        Cliente: venda.cliente,
        "Valor (R$)": venda.valor,
        Data: new Date(venda.data).toLocaleDateString("pt-BR"),
        "Forma de Pagamento": venda.formaPagamento,
        Status: venda.status,
        "Comissão (R$)": venda.comissao || 0,
      }));

      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          headers.map((header) => `"${row[header]}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `vendas-${periodLabel.replace(/\s+/g, "-")}-${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error("Erro ao exportar:", error);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportDashboardData,
    exportVendasData,
    isExporting,
  };
}
