// Localização: metas-comissoes/contexts/data-context.tsx
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
import { ptBR } from "date-fns/locale";
import { useNotificacao } from "./notificacao-context";

interface DataContextType {
  colaboradores: Colaborador[];
  lojas: Loja[];
  metas: Meta[];
  vendas: Venda[];
  formasPagamento: FormaPagamento[];
  comissoes: Comissao[];
  usuarios: Usuario[];
  addColaborador: (
    colaborador: Omit<Colaborador, "id" | "dataAdmissao" | "status">,
    userData?: Omit<
      Usuario,
      "id" | "colaboradorId" | "dataCriacao" | "nome" | "email"
    > & { tipo: string }
  ) => void;
  updateColaborador: (
    colaborador: Colaborador,
    acesso?: {
      criar: boolean;
      tipo?: "admin" | "colaborador" | "gerente";
    }
  ) => void;
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
  fecharMes: (novosValoresMetas?: { [metaId: number]: number }) => {
    novasComissoes: Comissao[];
    metasAtualizadas: Meta[];
  };
  setComissoes: React.Dispatch<React.SetStateAction<Comissao[]>>;
  setMetas: React.Dispatch<React.SetStateAction<Meta[]>>;
  notificacoesAtivas: any[];
  addUsuario: (
    usuario: Omit<Usuario, "id" | "dataCriacao"> & { status: string }
  ) => void;
  updateUsuario: (usuario: Usuario) => void;
  deleteUsuario: (id: number) => void;
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

  const { checkAndSendMetaNotification } = useNotificacao();

  const addColaborador = (
    colaborador: Omit<Colaborador, "id" | "dataAdmissao" | "status">,
    userData?: Omit<
      Usuario,
      "id" | "colaboradorId" | "dataCriacao" | "nome" | "email"
    > & { tipo: string }
  ) => {
    const novoIdColaborador =
      colaboradores.length > 0
        ? Math.max(...colaboradores.map((c) => c.id)) + 1
        : 1;
    const novoColaborador: Colaborador = {
      ...colaborador,
      id: novoIdColaborador,
      dataAdmissao: new Date().toISOString().split("T")[0],
      status: "ativo",
    };
    setColaboradores((prev) => [...prev, novoColaborador]);

    if (userData) {
      const novoIdUsuario =
        usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
      const novoUsuario: Usuario = {
        id: novoIdUsuario,
        nome: novoColaborador.nome,
        email: novoColaborador.email,
        tipo: userData.tipo === "admin" ? "admin" : "colaborador",
        colaboradorId: novoIdColaborador,
        status: "ativo",
        dataCriacao: new Date().toISOString().split("T")[0],
      };
      setUsuarios((prev) => [...prev, novoUsuario]);
    }
  };

  const updateColaborador = (
    colaboradorAtualizado: Colaborador,
    acesso?: {
      criar: boolean;
      tipo?: "admin" | "colaborador" | "gerente";
    }
  ) => {
    setColaboradores((prev) =>
      prev.map((c) =>
        c.id === colaboradorAtualizado.id ? colaboradorAtualizado : c
      )
    );

    const usuarioExistente = usuarios.find(
      (u) => u.colaboradorId === colaboradorAtualizado.id
    );

    if (acesso?.criar && !usuarioExistente && acesso.tipo) {
      const novoIdUsuario =
        usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
      const novoUsuario: Usuario = {
        id: novoIdUsuario,
        nome: colaboradorAtualizado.nome,
        email: colaboradorAtualizado.email,
        tipo: acesso.tipo === "admin" ? "admin" : "colaborador",
        colaboradorId: colaboradorAtualizado.id,
        status: "ativo",
        dataCriacao: new Date().toISOString().split("T")[0],
      };
      setUsuarios((prev) => [...prev, novoUsuario]);
    } else if (!acesso?.criar && usuarioExistente) {
      setUsuarios((prev) =>
        prev.filter((u) => u.colaboradorId !== colaboradorAtualizado.id)
      );
    } else if (acesso?.criar && usuarioExistente && acesso.tipo) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.colaboradorId === colaboradorAtualizado.id
            ? {
                ...u,
                tipo: acesso.tipo === "admin" ? "admin" : "colaborador",
                nome: colaboradorAtualizado.nome,
                email: colaboradorAtualizado.email,
              }
            : u
        )
      );
    }
  };

  const deleteColaborador = (id: number) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
    setUsuarios((prev) => prev.filter((u) => u.colaboradorId !== id));
  };

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
    const novaVenda = { ...venda, id: novoId };
    const novasVendas = [...vendas, novaVenda];
    setVendas(novasVendas);
    // Adicione "colaboradores" no final da chamada
    checkAndSendMetaNotification(
      venda.colaboradorId,
      novasVendas,
      metas,
      colaboradores
    );
  };

  const addVendasBatch = (novasVendas: Omit<Venda, "id">[]) => {
    let ultimoId = vendas.length > 0 ? Math.max(...vendas.map((v) => v.id)) : 0;
    const vendasComId = novasVendas.map((venda) => ({
      ...venda,
      id: ++ultimoId,
    }));
    const todasAsVendas = [...vendas, ...vendasComId];
    setVendas(todasAsVendas);
    const colaboradoresAfetados = new Set(
      vendasComId.map((v) => v.colaboradorId)
    );
    colaboradoresAfetados.forEach((colaboradorId) => {
      // Adicione "colaboradores" no final da chamada
      checkAndSendMetaNotification(
        colaboradorId,
        todasAsVendas,
        metas,
        colaboradores
      );
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

  const addUsuario = (
    usuario: Omit<Usuario, "id" | "dataCriacao"> & { status: string }
  ) => {
    const novoId =
      usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
    setUsuarios((prev) => [
      ...prev,
      {
        ...usuario,
        id: novoId,
        dataCriacao: new Date().toISOString().split("T")[0],
      },
    ]);
  };
  const updateUsuario = (usuarioAtualizado: Usuario) =>
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioAtualizado.id ? usuarioAtualizada : u))
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

    const filteredVendas = vendas.filter((v) => isDateInPeriod(v.data));

    const vendasPorVendedor = colaboradores
      .filter((c) => c.tipo === "vendedor")
      .map((col) => ({
        name: col.nome.split(" ")[0],
        value: filteredVendas
          .filter((v) => v.colaboradorId === col.id)
          .reduce((sum, v) => sum + v.valor, 0),
      }))
      .filter((item) => item.value > 0);

    const vendasPorPagamento = formasPagamento
      .map((fp) => ({
        name: fp.nome,
        value: filteredVendas
          .filter((v) => v.formaPagamento === fp.codigo)
          .reduce((sum, v) => sum + v.valor, 0),
      }))
      .filter((item) => item.value > 0);

    const colaboradoresData = colaboradores
      .filter((c) => c.status === "ativo" && c.tipo === "vendedor")
      .map((colaborador) => {
        const metasMensais = metas.filter(
          (m) =>
            m.colaboradorId === colaborador.id &&
            (m.status === "ativa" || m.status === "concluida") && // <-- CORREÇÃO APLICADA AQUI
            m.tipo === "mensal" &&
            m.periodo === periodToFilter
        );
        const metasAnuais = metas.filter(
          (m) =>
            m.colaboradorId === colaborador.id &&
            (m.status === "ativa" || m.status === "concluida") && // <-- CORREÇÃO APLICADA AQUI
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

    const performancePeriodoSelecionado = colaboradores
      .filter((c) => c.tipo === "vendedor")
      .map((colaborador) => {
        const totalVendido = vendas
          .filter(
            (v) =>
              v.colaboradorId === colaborador.id &&
              v.data.startsWith(periodToFilter)
          )
          .reduce((sum, v) => sum + v.valor, 0);

        if (totalVendido === 0) {
          return null;
        }

        const metaColaborador = metas.find(
          (m) =>
            m.colaboradorId === colaborador.id &&
            m.periodo === periodToFilter &&
            (m.status === "ativa" || m.status === "concluida") && // <-- CORREÇÃO APLICADA AQUI
            m.tipo === "mensal"
        );

        return {
          name: colaborador.nome.split(" ")[0],
          meta: metaColaborador?.valorMeta || 0,
          vendido: totalVendido,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const desempenhoPorEquipe = lojas.map((loja) => {
      const metasEquipe = metas.filter(
        (m) =>
          m.lojaId === loja.id &&
          (m.status === "ativa" || m.status === "concluida") && // <-- CORREÇÃO APLICADA AQUI
          m.periodo.startsWith(yearToFilter)
      );
      const colaboradoresDaLoja = colaboradores.filter(
        (c) => c.lojaId === loja.id
      );
      const idsColaboradores = colaboradoresDaLoja.map((c) => c.id);
      const vendasDaLojaNoMes = vendas.filter(
        (v) =>
          idsColaboradores.includes(v.colaboradorId) &&
          v.data.startsWith(periodToFilter)
      );
      const totalVendidoMes = vendasDaLojaNoMes.reduce(
        (sum, v) => sum + v.valor,
        0
      );
      const metaMensalEquipe = metasEquipe.find(
        (m) => m.tipo === "mensal" && m.periodo === periodToFilter
      );
      return {
        loja,
        colaboradores: colaboradoresDaLoja,
        totalVendidoMes,
        metaMensal: metaMensalEquipe
          ? {
              ...metaMensalEquipe,
              vendido: totalVendidoMes,
              percentual:
                metaMensalEquipe.valorMeta > 0
                  ? Math.round(
                      (totalVendidoMes / metaMensalEquipe.valorMeta) * 100
                    )
                  : 0,
            }
          : null,
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

    const totalVendidoAnual = vendas
      .filter((v) => v.data.startsWith(yearToFilter))
      .reduce((sum, v) => sum + v.valor, 0);

    const totalMetaAnual = metas
      .filter(
        (m) =>
          m.periodo === yearToFilter &&
          m.tipo === "anual" &&
          (m.status === "ativa" || m.status === "concluida") // <-- CORREÇÃO APLICADA AQUI
      )
      .reduce((sum, m) => sum + m.valorMeta, 0);

    const performanceAnual = colaboradores
      .filter((c) => c.tipo === "vendedor")
      .map((colaborador) => {
        const totalVendido = vendas
          .filter(
            (v) =>
              v.colaboradorId === colaborador.id &&
              v.data.startsWith(yearToFilter)
          )
          .reduce((sum, v) => sum + v.valor, 0);

        const metaColaborador = metas.find(
          (m) =>
            m.colaboradorId === colaborador.id &&
            m.periodo === yearToFilter &&
            (m.status === "ativa" || m.status === "concluida") && // <-- CORREÇÃO APLICADA AQUI
            m.tipo === "anual"
        );

        return {
          name: colaborador.nome.split(" ")[0],
          meta: metaColaborador?.valorMeta || 0,
          vendido: totalVendido,
        };
      });

    const performanceMensalNoAno = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(Number(yearToFilter), i, 1), "MMM", {
        locale: ptBR,
      }),
    }));

    colaboradores.forEach((colaborador) => {
      const vendasDoColaboradorNoAno = vendas.filter(
        (v) =>
          v.colaboradorId === colaborador.id && v.data.startsWith(yearToFilter)
      );

      if (vendasDoColaboradorNoAno.length > 0) {
        performanceMensalNoAno.forEach((mes, index) => {
          const mesAtual = String(index + 1).padStart(2, "0");
          const vendasDoMes = vendasDoColaboradorNoAno.filter(
            (v) => v.data.substring(5, 7) === mesAtual
          );
          const totalVendidoNoMes = vendasDoMes.reduce(
            (sum, v) => sum + v.valor,
            0
          );
          (mes as any)[colaborador.nome.split(" ")[0]] = totalVendidoNoMes;
        });
      }
    });

    const colaboradoresAtivos = colaboradores.filter(
      (c) => c.status === "ativo" && c.tipo === "vendedor"
    ).length;

    const colaboradoresAcimaMeta = colaboradoresData.filter((col) =>
      col.metasMensais.some((meta) => meta.percentual >= 100)
    ).length;

    const colaboradoresAbaixo80 = colaboradoresData.filter((col) =>
      col.metasMensais.some((meta) => meta.percentual < 80)
    ).length;

    const ticketMedio =
      filteredVendas.length > 0 ? totalVendido / filteredVendas.length : 0;

    const metasAtivas = metas.filter(
      (m) => m.status === "ativa" && isDateInPeriod(m.periodo)
    ).length;

    return {
      colaboradoresData,
      totalMetaMensal,
      totalVendido,
      totalComissao,
      percentualGeralMensal,
      filteredVendas,
      vendasPorVendedor,
      vendasPorPagamento,
      performancePeriodoSelecionado,
      desempenhoPorEquipe,
      totalMetaAnual,
      totalVendidoAnual,
      performanceAnual,
      performanceMensalNoAno,
      colaboradoresAtivos,
      colaboradoresAcimaMeta,
      colaboradoresAbaixo80,
      ticketMedio,
      metasAtivas,
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
    const periodToFilter =
      filterMode === "live"
        ? format(simulationDate, "yyyy-MM")
        : selectedPeriod;

    const vendasDoPeriodo = vendas.filter((v) =>
      v.data.startsWith(periodToFilter)
    );

    const calcularComissao = (valor: number, forma: string) => {
      const percentual =
        formasPagamento.find((f) => f.codigo === forma)?.percentualComissao ||
        0;
      return (valor * percentual) / 100;
    };

    const vendasPorColaborador = colaboradores.map((col) => {
      const vendasColaborador = vendasDoPeriodo.filter(
        (v) => v.colaboradorId === col.id
      );

      const detalhesFormasPagamento = formasPagamento.map((forma) => {
        const vendasPorForma = vendasColaborador.filter(
          (v) => v.formaPagamento === forma.codigo
        );
        const totalVendas = vendasPorForma.reduce((sum, v) => sum + v.valor, 0);
        const comissao = totalVendas * (forma.percentualComissao / 100);
        return {
          formaPagamento: forma.nome,
          totalVendas,
          comissao,
        };
      });

      const totalComissao = detalhesFormasPagamento.reduce(
        (sum, d) => sum + d.comissao,
        0
      );
      const totalVendas = vendasColaborador.reduce(
        (sum, v) => sum + v.valor,
        0
      );

      return {
        colaborador: col,
        quantidadeVendas: vendasColaborador.length,
        totalVendas,
        totalComissao,
        detalhesFormasPagamento,
        vendas: vendasColaborador,
      };
    });

    return {
      vendasPorColaborador,
    };
  }, [
    vendas,
    colaboradores,
    formasPagamento,
    filterMode,
    selectedPeriod,
    simulationDate,
  ]);

  const fecharMes = useCallback(
    (novosValoresMetas?: { [metaId: number]: number }) => {
      const previousMonthPeriod = getPreviousMonthPeriod();
      // Garante que não haverá problemas de fuso horário ao adicionar um mês
      const previousMonthDate = new Date(`${previousMonthPeriod}-01T12:00:00`);
      const nextMonthPeriod = format(
        addMonths(previousMonthDate, 1),
        "yyyy-MM"
      );

      const vendasDoPeriodo = vendas.filter((v) =>
        v.data.startsWith(previousMonthPeriod)
      );

      const calcularComissao = (valor: number, forma: string) => {
        const percentual =
          formasPagamento.find((f) => f.codigo === forma)?.percentualComissao ||
          0;
        return (valor * percentual) / 100;
      };

      const novasComissoes: Comissao[] = [];
      const colaboradoresComVendas = colaboradores.filter((col) =>
        vendasDoPeriodo.some((v) => v.colaboradorId === col.id)
      );

      let ultimoIdComissao =
        comissoes.length > 0 ? Math.max(...comissoes.map((c) => c.id)) : 0;

      for (const col of colaboradoresComVendas) {
        const vendasColaborador = vendasDoPeriodo.filter(
          (v) => v.colaboradorId === col.id
        );
        if (vendasColaborador.length > 0) {
          const valorTotalComissao = vendasColaborador.reduce((sum, v) => {
            return sum + calcularComissao(v.valor, v.formaPagamento);
          }, 0);

          const detalhes = formasPagamento.map((forma) => {
            const vendasPorForma = vendasColaborador.filter(
              (v) => v.formaPagamento === forma.codigo
            );
            const totalVendas = vendasPorForma.reduce(
              (sum, v) => sum + v.valor,
              0
            );
            const comissao = totalVendas * (forma.percentualComissao / 100);
            return {
              formaPagamento: forma.nome,
              valor: totalVendas,
              comissao: comissao,
            };
          });

          novasComissoes.push({
            id: ++ultimoIdComissao,
            colaboradorId: col.id,
            periodo: previousMonthPeriod,
            valorComissao: valorTotalComissao,
            status: "pendente",
            dataCalculo: new Date().toISOString().split("T")[0],
            detalhes,
          });
        }
      }

      // --- Lógica de Replicação de Metas Corrigida ---
      let ultimoIdMeta =
        metas.length > 0 ? Math.max(...metas.map((m) => m.id)) : 0;

      const metasRecorrentesDoPeriodo = metas.filter(
        (meta) =>
          meta.periodo === previousMonthPeriod &&
          meta.recorrente &&
          meta.tipo === "mensal"
      );

      const novasMetasReplicadas = metasRecorrentesDoPeriodo.map((meta) => {
        const novoValor = novosValoresMetas?.[meta.id] ?? meta.valorMeta;
        ultimoIdMeta++;
        return {
          ...meta,
          id: ultimoIdMeta,
          periodo: nextMonthPeriod, // <<< AQUI ESTÁ A CORREÇÃO PRINCIPAL
          valorMeta: novoValor,
          status: "ativa" as const,
        };
      });

      const metasComStatusAtualizado = metas.map((meta) => {
        // Marca a meta recorrente antiga como 'concluida'
        if (metasRecorrentesDoPeriodo.some((m) => m.id === meta.id)) {
          return { ...meta, status: "concluida" as const };
        }
        return meta;
      });

      const metasAtualizadas = [
        ...metasComStatusAtualizado,
        ...novasMetasReplicadas,
      ];

      return { novasComissoes, metasAtualizadas };
    },
    [
      getPreviousMonthPeriod,
      vendas,
      formasPagamento,
      colaboradores,
      comissoes,
      metas,
    ]
  );

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
    aprovarComissao,
    rejeitarComissao,
    marcarComissaoPaga,
    getDashboardData,
    getComissoesBaseadasEmVendas,
    fecharMes,
    setComissoes,
    setMetas,
    notificacoesAtivas: [],
    addUsuario,
    updateUsuario,
    deleteUsuario,
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
