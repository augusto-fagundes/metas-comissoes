// Localização: metas/components/import-vendas.tsx

"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportedVenda {
  originalIndex: number;
  colaborador: string;
  cliente: string;
  valor: string;
  data: string;
  formaPagamento: string;
  status: "valid" | "error";
  errors: string[];
}

interface ImportVendasProps {
  onClose: () => void;
}

export function ImportVendas({ onClose }: ImportVendasProps) {
  const { colaboradores, formasPagamento, addVendasBatch } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState<ImportedVenda[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validCount, setValidCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setValidCount(importedData.filter((r) => r.status === "valid").length);
    setErrorCount(importedData.filter((r) => r.status === "error").length);
  }, [importedData]);

  const resetState = () => {
    setImportedData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const template = [
      ["Colaborador", "Cliente", "Valor", "Data", "Forma de Pagamento"],
      ["João Silva", "Cliente Exemplo", "1500.00", "2024-01-15", "PIX"],
    ];
    const csvContent = template.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template-vendas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateRow = (row: any): Pick<ImportedVenda, "status" | "errors"> => {
    const errors: string[] = [];
    if (
      !colaboradores.some(
        (c) => c.nome.toLowerCase() === (row.colaborador || "").toLowerCase()
      )
    )
      errors.push("Colaborador");
    if (isNaN(parseFloat(row.valor)) || parseFloat(row.valor) <= 0)
      errors.push("Valor");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.data)) errors.push("Data");
    if (
      !formasPagamento.some(
        (f) =>
          f.codigo.toLowerCase() === (row.formaPagamento || "").toLowerCase()
      )
    )
      errors.push("Pagamento");
    return { status: errors.length === 0 ? "valid" : "error", errors };
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2)
        throw new Error("Arquivo deve conter cabeçalho e dados.");

      const headers = lines[0]
        .split(",")
        .map((h) =>
          h
            .trim()
            .replace(/"/g, "")
            .toLowerCase()
            .replace("forma de pagamento", "formapagamento")
        );
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        let rowData: any = { originalIndex: index };
        headers.forEach((header, i) => {
          rowData[header] = values[i] || "";
        });

        if (rowData.formapagamento) {
          rowData.formaPagamento = rowData.formapagamento;
        }

        const validation = validateRow(rowData);
        return {
          originalIndex: index,
          colaborador: rowData.colaborador || "",
          cliente: rowData.cliente || "",
          valor: rowData.valor || "",
          data: rowData.data || "",
          formaPagamento: rowData.formaPagamento || "",
          ...validation,
        };
      });
      setImportedData(data);
    } catch (error) {
      toast({
        title: "Erro ao ler arquivo",
        description:
          error instanceof Error ? error.message : "Formato inválido.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldChange = (
    index: number,
    field: keyof Omit<ImportedVenda, "originalIndex" | "status" | "errors">,
    value: string
  ) => {
    const updatedData = [...importedData];
    const rowIndex = updatedData.findIndex((r) => r.originalIndex === index);
    if (rowIndex === -1) return;
    const updatedRow = { ...updatedData[rowIndex], [field]: value };
    const validation = validateRow(updatedRow);
    updatedData[rowIndex] = { ...updatedRow, ...validation };
    setImportedData(updatedData);
  };

  const confirmImport = async () => {
    const validRows = importedData.filter((row) => row.status === "valid");
    if (validRows.length === 0) return;
    setIsProcessing(true);
    try {
      const vendasParaAdicionar = validRows.map((row) => {
        const colaborador = colaboradores.find(
          (c) => c.nome.toLowerCase() === row.colaborador.toLowerCase()
        );
        return {
          colaboradorId: colaborador!.id,
          cliente: row.cliente,
          valor: parseFloat(row.valor),
          data: row.data,
          formaPagamento: row.formaPagamento.toUpperCase(),
          status: "confirmada" as const,
        };
      });
      addVendasBatch(vendasParaAdicionar);
      toast({
        title: "Importação concluída!",
        description: `${validRows.length} vendas importadas.`,
      });
      onClose(); // Fecha a interface após a importação
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet /> Importar Vendas
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {importedData.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-lg">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? "Processando..." : "Selecionar Arquivo"}
            </Button>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Baixar Template
            </Button>
            <Alert className="mt-4 w-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                As colunas devem ser: Colaborador, Cliente, Valor, Data
                (YYYY-MM-DD), Forma de Pagamento.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {validCount} válidos
                </Badge>
                {errorCount > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errorCount} com erro
                  </Badge>
                )}
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                disabled={isProcessing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Carregar Outro
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[200px]">Colaborador</TableHead>
                    <TableHead className="min-w-[250px]">Cliente</TableHead>
                    <TableHead className="min-w-[150px]">Valor</TableHead>
                    <TableHead className="min-w-[150px]">Data</TableHead>
                    <TableHead className="min-w-[200px]">Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.map((row) => (
                    <TableRow key={row.originalIndex}>
                      <TableCell className="text-center align-middle">
                        {row.status === "valid" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle
                            className="w-5 h-5 text-red-500"
                            title={`Erros: ${row.errors.join(", ")}`}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.colaborador}
                          onValueChange={(value) =>
                            handleFieldChange(
                              row.originalIndex,
                              "colaborador",
                              value
                            )
                          }
                        >
                          <SelectTrigger
                            className={
                              row.errors.includes("Colaborador")
                                ? "border-red-500"
                                : ""
                            }
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colaboradores.map((c) => (
                              <SelectItem key={c.id} value={c.nome}>
                                {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.cliente}
                          onChange={(e) =>
                            handleFieldChange(
                              row.originalIndex,
                              "cliente",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.valor}
                          onChange={(e) =>
                            handleFieldChange(
                              row.originalIndex,
                              "valor",
                              e.target.value
                            )
                          }
                          className={
                            row.errors.includes("Valor") ? "border-red-500" : ""
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={row.data}
                          onChange={(e) =>
                            handleFieldChange(
                              row.originalIndex,
                              "data",
                              e.target.value
                            )
                          }
                          className={
                            row.errors.includes("Data") ? "border-red-500" : ""
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.formaPagamento.toUpperCase()}
                          onValueChange={(value) =>
                            handleFieldChange(
                              row.originalIndex,
                              "formaPagamento",
                              value
                            )
                          }
                        >
                          <SelectTrigger
                            className={
                              row.errors.includes("Pagamento")
                                ? "border-red-500"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {formasPagamento.map((f) => (
                              <SelectItem key={f.id} value={f.codigo}>
                                {f.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={confirmImport}
                disabled={isProcessing || validCount === 0}
              >
                Importar {validCount} Vendas
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
