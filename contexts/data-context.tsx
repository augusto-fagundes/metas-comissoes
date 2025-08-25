"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import {
  colaboradores as initialColaboradores,
  lojas as initialLojas,
  metas as initialMetas,
  vendas as initialVendas,
  formasPagamento as initialFormasPagamento,
  comissoes as initialComissoes,
  usuarios as initialUsuarios,
  type Colaborador,
  type Loja,
  type Meta,
  type Venda,
  type FormaPagamento,
  type Comissao,
  type Usuario,
} from "@/data/mock-data";
import { usePeriodFilter } from "./period-filter-context";
import { toast } from "@/hooks/use-toast";
import { format, addMonths } from "date-fns";

interface DataContextType {
  colaboradores: Colaborador[];
  lojas: Loja[];
  metas: Meta[];
  vendas: Venda[];
  formasPagamento: FormaPagamento[];
  comissoes: Comissao[];
  usuarios: Usuario[];
  addColaborador: (
    colaborador: Omit<Colaborador, "id" | "dataAdmissao" | "status">
  ) => void;
  updateColaborador: (colaborador: Colaborador) => void;
  deleteColaborador: (id: number) => void;
  addLoja: (loja: Omit<Loja, "id">) => void;
  updateLoja: (loja: Loja) => void;
  deleteLoja: (id: number) => void;
  addMeta: (meta: Omit<Meta, "id" | "status">) => void;
  updateMeta: (meta: Meta) => void;
  deleteMeta: (id: number) => void;
  addVenda: (venda: Omit<Venda, "id">) => void;
  addVendasBatch: (vendas: Omit<Venda, "id">[]) => void;
  updateVenda: (venda: Venda) => void;
  deleteVenda: (id: number) => void;
  addFormaPagamento: (forma: Omit<FormaPagamento, "id">) => void;
  updateFormaPagamento: (forma: FormaPagamento) => void;
  deleteFormaPagamento: (id: number) => void;
  addUsuario: (usuario: Omit<Usuario, "id" | "dataCriacao">) => void;
  updateUsuario: (usuario: Usuario) => void;
  deleteUsuario: (id: number) => void;
  aprovarComissao: (
    id: number,
    aprovadoPor: number,
    observacoes?: string
  ) => void;
  rejeitarComissao: (
    id: number,
    rejeitadoPor: number,
    observacoes: string
  ) => void;
  marcarComissaoPaga: (id: number) => void;
  getDashboardData: () => any;
  getComissoesBaseadasEmVendas: () => any;
  fecharMes: () => void;
  notificacoesAtivas: any[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [colaboradores, setColaboradores] =
    useState<Colaborador[]>(initialColaboradores);
  const [lojas, setLojas] = useState<Loja[]>(initialLojas);
  const [metas, setMetas] = useState<Meta[]>(initialMetas);
  const [vendas, setVendas] = useState<Venda[]>(initialVendas);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>(
    initialFormasPagamento
  );
  const [comissoes, setComissoes] = useState<Comissao[]>(initialComissoes);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);

  const {
    isDateInPeriod,
    selectedPeriod,
    getPreviousMonthPeriod,
    filterMode,
    simulationDate,
  } = usePeriodFilter();

  const addColaborador = (
    colaborador: Omit<Colaborador, "id" | "dataAdmissao" | "status">
  ) => {
    const novoId =
      colaboradores.length > 0
        ? Math.max(...colaboradores.map((c) => c.id)) + 1
        : 1;
    const novoColaborador: Colaborador = {
      ...colaborador,
      id: novoId,
      dataAdmissao: new Date().toISOString().split("T")[0],
      status: "ativo",
    };
    setColaboradores((prev) => [...prev, novoColaborador]);
  };
  const updateColaborador = (colaboradorAtualizado: Colaborador) =>
    setColaboradores((prev) =>
      prev.map((c) =>
        c.id === colaboradorAtualizado.id ? colaboradorAtualizado : c
      )
    );
  const deleteColaborador = (id: number) =>
    setColaboradores((prev) => prev.filter((c) => c.id !== id));

  const addLoja = (loja: Omit<Loja, "id">) => {
    const novoId =
      lojas.length > 0 ? Math.max(...lojas.map((l) => l.id)) + 1 : 1;
    setLojas((prev) => [...prev, { ...loja, id: novoId }]);
  };
  const updateLoja = (lojaAtualizada: Loja) =>
    setLojas((prev) =>
      prev.map((l) => (l.id === lojaAtualizada.id ? lojaAtualizada : l))
    );
  const deleteLoja = (id: number) =>
    setLojas((prev) => prev.filter((l) => l.id !== id));

  const addMeta = (meta: Omit<Meta, "id" | "status">) => {
    const novoId =
      metas.length > 0 ? Math.max(...metas.map((m) => m.id)) + 1 : 1;
    setMetas((prev) => [...prev, { ...meta, id: novoId, status: "ativa" }]);
  };
  const updateMeta = (metaAtualizada: Meta) =>
    setMetas((prev) =>
      prev.map((m) => (m.id === metaAtualizada.id ? metaAtualizada : m))
    );
  const deleteMeta = (id: number) =>
    setMetas((prev) => prev.filter((m) => m.id !== id));

  const addVenda = (venda: Omit<Venda, "id">) => {
    const novoId =
      vendas.length > 0 ? Math.max(...vendas.map((v) => v.id)) + 1 : 1;
    setVendas((prev) => [...prev, { ...venda, id: novoId }]);
  };
  const addVendasBatch = (novasVendas: Omit<Venda, "id">[]) => {
    setVendas((prevVendas) => {
      let ultimoId =
        prevVendas.length > 0 ? Math.max(...prevVendas.map((v) => v.id)) : 0;
      const vendasComId = novasVendas.map((venda) => ({
        ...venda,
        id: ++ultimoId,
      }));
      return [...prevVendas, ...vendasComId];
    });
  };
  const updateVenda = (vendaAtualizada: Venda) =>
    setVendas((prev) =>
      prev.map((v) => (v.id === vendaAtualizada.id ? vendaAtualizada : v))
    );
  const deleteVenda = (id: number) =>
    setVendas((prev) => prev.filter((v) => v.id !== id));

  const addFormaPagamento = (forma: Omit<FormaPagamento, "id">) => {
    const novoId =
      formasPagamento.length > 0
        ? Math.max(...formasPagamento.map((f) => f.id)) + 1
        : 1;
    setFormasPagamento((prev) => [...prev, { ...forma, id: novoId }]);
  };
  const updateFormaPagamento = (formaAtualizada: FormaPagamento) =>
    setFormasPagamento((prev) =>
      prev.map((f) => (f.id === formaAtualizada.id ? formaAtualizada : f))
    );
  const deleteFormaPagamento = (id: number) =>
    setFormasPagamento((prev) => prev.filter((f) => f.id !== id));

  const addUsuario = (usuario: Omit<Usuario, "id" | "dataCriacao">) => {
    const novoId =
      usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
    const novoUsuario = {
      ...usuario,
      id: novoId,
      dataCriacao: new Date().toISOString().split("T")[0],
    };
    setUsuarios((prev) => [...prev, novoUsuario]);
  };
  const updateUsuario = (usuarioAtualizado: Usuario) =>
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioAtualizado.id ? usuarioAtualizado : u))
    );
  const deleteUsuario = (id: number) =>
    setUsuarios((prev) => prev.filter((u) => u.id !== id));

  const aprovarComissao = (
    id: number,
    aprovadoPor: number,
    observacoes?: string
  ) => {
    setComissoes((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "aprovada",
              aprovadoPor,
              dataAprovacao: new Date().toISOString(),
              observacoes,
            }
          : c
      )
    );
  };
  const rejeitarComissao = (
    id: number,
    rejeitadoPor: number,
    observacoes: string
  ) => {
    setComissoes((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "rejeitada",
              aprovadoPor: rejeitadoPor,
              dataAprovacao: new Date().toISOString(),
              observacoes,
            }
          : c
      )
    );
  };
  const marcarComissaoPaga = (id: number) => {
    setComissoes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "paga" } : c))
    );
  };

  const getDashboardData = useCallback(() => {
    const periodToFilter =
      filterMode === "live"
        ? format(simulationDate, "yyyy-MM")
        : selectedPeriod;
    const yearToFilter = periodToFilter.substring(0, 4);

    const colaboradoresData = colaboradores
      .filter((c) => c.status === "ativo")
      .map((colaborador) => {
        const metasMensais = metas.filter(
          (m) =>
            m.colaboradorId === colaborador.id &&
            m.status === "ativa" &&
            m.tipo === "mensal" &&
            m.periodo === periodToFilter
        );
        const metasAnuais = metas.filter(
          (m) =>
            m.colaboradorId === colaborador.id &&
            m.status === "ativa" &&
            m.tipo === "anual" &&
            m.periodo === yearToFilter
        );

        const vendasNoMes = vendas.filter(
          (v) =>
            v.colaboradorId === colaborador.id &&
            v.data.startsWith(periodToFilter)
        );
        const vendasNoAno = vendas.filter(
          (v) =>
            v.colaboradorId === colaborador.id &&
            v.data.startsWith(yearToFilter)
        );

        const vendidoMes = vendasNoMes.reduce((sum, v) => sum + v.valor, 0);
        const vendidoAno = vendasNoAno.reduce((sum, v) => sum + v.valor, 0);

        const comissaoMes = vendasNoMes.reduce((sum, venda) => {
          const forma = formasPagamento.find(
            (f) => f.codigo === venda.formaPagamento
          );
          return (
            sum + (forma ? (venda.valor * forma.percentualComissao) / 100 : 0)
          );
        }, 0);

        return {
          id: colaborador.id,
          nome: colaborador.nome,
          cargo: colaborador.cargo,
          equipe:
            lojas.find((l) => l.id === colaborador.lojaId)?.nome || "Sem loja",
          foto: colaborador.foto,

          metasMensais: metasMensais.map((meta) => ({
            ...meta,
            vendido: vendidoMes,
            percentual:
              meta.valorMeta > 0
                ? Math.round((vendidoMes / meta.valorMeta) * 100)
                : 0,
          })),

          metasAnuais: metasAnuais.map((meta) => ({
            ...meta,
            vendido: vendidoAno,
            percentual:
              meta.valorMeta > 0
                ? Math.round((vendidoAno / meta.valorMeta) * 100)
                : 0,
          })),

          vendidoMes,
          comissaoMes,
        };
      });

    const totalVendido = colaboradoresData.reduce(
      (sum, col) => sum + col.vendidoMes,
      0
    );
    const totalMetaMensal = colaboradoresData.reduce(
      (sum, col) => sum + col.metasMensais.reduce((s, m) => s + m.valorMeta, 0),
      0
    );
    const totalComissao = colaboradoresData.reduce(
      (sum, col) => sum + col.comissaoMes,
      0
    );
    const percentualGeralMensal =
      totalMetaMensal > 0
        ? Math.round((totalVendido / totalMetaMensal) * 100)
        : 0;

    return {
      colaboradoresData,
      totalMetaMensal,
      totalVendido,
      totalComissao,
      percentualGeralMensal,
      filteredVendas: vendas.filter((v) => isDateInPeriod(v.data)),
    };
  }, [
    vendas,
    metas,
    colaboradores,
    lojas,
    formasPagamento,
    isDateInPeriod,
    filterMode,
    simulationDate,
    selectedPeriod,
  ]);

  const getComissoesBaseadasEmVendas = useCallback(() => {
    const filteredVendas = vendas.filter((v) => isDateInPeriod(v.data));

    const vendasPorColaborador = colaboradores
      .map((colaborador) => {
        const vendasColaborador = filteredVendas.filter(
          (v) => v.colaboradorId === colaborador.id
        );
        if (vendasColaborador.length === 0) return null;

        const loja = lojas.find((l) => l.id === colaborador.lojaId);
        const colaboradorComLoja = {
          ...colaborador,
          equipe: loja?.nome || "Sem loja",
        };

        const totalVendas = vendasColaborador.reduce(
          (total, v) => total + v.valor,
          0
        );

        const detalhesFormasPagamento = formasPagamento
          .map((forma) => {
            const vendasDaForma = vendasColaborador.filter(
              (v) => v.formaPagamento === forma.codigo
            );
            const totalVendasForma = vendasDaForma.reduce(
              (sum, v) => sum + v.valor,
              0
            );
            const comissaoForma =
              (totalVendasForma * forma.percentualComissao) / 100;
            return {
              formaPagamento: forma.nome,
              quantidadeVendas: vendasDaForma.length,
              totalVendas: totalVendasForma,
              percentualComissao: forma.percentualComissao,
              comissao: comissaoForma,
            };
          })
          .filter((d) => d.quantidadeVendas > 0);

        const totalComissao = detalhesFormasPagamento.reduce(
          (sum, d) => sum + d.comissao,
          0
        );

        return {
          colaborador: colaboradorComLoja,
          vendas: vendasColaborador,
          detalhesFormasPagamento,
          quantidadeVendas: vendasColaborador.length,
          totalVendas,
          totalComissao,
        };
      })
      .filter(Boolean);

    const totalGeralComissoes = vendasPorColaborador.reduce(
      (sum, d) => sum + (d?.totalComissao ?? 0),
      0
    );

    const resumoPorForma = formasPagamento
      .map((forma) => {
        const vendasDaForma = filteredVendas.filter(
          (v) => v.formaPagamento === forma.codigo
        );
        const totalVendasForma = vendasDaForma.reduce(
          (sum, v) => sum + v.valor,
          0
        );
        const comissaoForma =
          (totalVendasForma * forma.percentualComissao) / 100;
        return {
          ...forma,
          formaPagamento: forma.nome,
          quantidadeVendas: vendasDaForma.length,
          totalVendas: totalVendasForma,
          comissao: comissaoForma,
        };
      })
      .filter((d) => d.quantidadeVendas > 0);

    return {
      vendasPorColaborador,
      totalGeralComissoes,
      resumoPorForma,
    };
  }, [vendas, colaboradores, lojas, formasPagamento, isDateInPeriod]);

  const fecharMes = useCallback(() => {
    const periodoFechamento = getPreviousMonthPeriod();
    const vendasDoPeriodo = vendas.filter((v) =>
      v.data.startsWith(periodoFechamento)
    );

    if (vendasDoPeriodo.length === 0) {
      toast({
        title: "Nenhuma venda no mês anterior para fechar.",
        variant: "destructive",
      });
      return;
    }

    const novasMetas: Meta[] = [];
    const metasAtualizadas = metas.map((meta) => {
      if (meta.periodo === periodoFechamento && meta.status === "ativa") {
        if (meta.recorrente && meta.tipo === "mensal") {
          const proximoPeriodoDate = addMonths(
            new Date(`${periodoFechamento}-01T12:00:00`),
            1
          );
          const proximoPeriodo = format(proximoPeriodoDate, "yyyy-MM");
          const novaMeta: Meta = {
            ...meta,
            id:
              Math.max(
                ...metas.map((m) => m.id),
                ...novasMetas.map((m) => m.id),
                0
              ) + 1,
            periodo: proximoPeriodo,
            status: "ativa",
          };
          novasMetas.push(novaMeta);
        }
        return { ...meta, status: "concluida" as const };
      }
      return meta;
    });

    setMetas([...metasAtualizadas, ...novasMetas]);

    const comissoesCalculadas: Comissao[] = [];
    colaboradores.forEach((col) => {
      const vendasColaborador = vendasDoPeriodo.filter(
        (v) => v.colaboradorId === col.id
      );
      if (vendasColaborador.length > 0) {
        const detalhes = formasPagamento
          .map((fp) => {
            const vendasDaForma = vendasColaborador.filter(
              (v) => v.formaPagamento === fp.codigo
            );
            const valor = vendasDaForma.reduce((sum, v) => sum + v.valor, 0);
            return {
              formaPagamento: fp.nome,
              valor,
              comissao: (valor * fp.percentualComissao) / 100,
            };
          })
          .filter((d) => d.valor > 0);

        const valorComissao = detalhes.reduce((sum, d) => sum + d.comissao, 0);

        if (valorComissao > 0) {
          const novaComissao: Comissao = {
            id:
              Math.max(
                ...comissoes.map((c) => c.id),
                ...comissoesCalculadas.map((c) => c.id),
                0
              ) + 1,
            colaboradorId: col.id,
            periodo: periodoFechamento,
            valorComissao,
            status: "pendente",
            dataCalculo: new Date().toISOString(),
            detalhes,
          };
          comissoesCalculadas.push(novaComissao);
        }
      }
    });

    setComissoes((prev) => [...prev, ...comissoesCalculadas]);

    toast({
      title: `Mês ${periodoFechamento} fechado!`,
      description: `${comissoesCalculadas.length} comissões geradas para aprovação.`,
    });
  }, [
    metas,
    vendas,
    colaboradores,
    formasPagamento,
    comissoes,
    getPreviousMonthPeriod,
  ]);

  const value = {
    colaboradores,
    lojas,
    metas,
    vendas,
    formasPagamento,
    comissoes,
    usuarios,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    addLoja,
    updateLoja,
    deleteLoja,
    addMeta,
    updateMeta,
    deleteMeta,
    addVenda,
    addVendasBatch,
    updateVenda,
    deleteVenda,
    addFormaPagamento,
    updateFormaPagamento,
    deleteFormaPagamento,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    aprovarComissao,
    rejeitarComissao,
    marcarComissaoPaga,
    getDashboardData,
    getComissoesBaseadasEmVendas,
    fecharMes,
    notificacoesAtivas: [],
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
