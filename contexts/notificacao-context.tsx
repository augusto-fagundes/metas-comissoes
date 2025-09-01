// contexts/notificacao-context.tsx - CÓDIGO CORRIGIDO
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
// REMOVEMOS o import do useData daqui
import { usePeriodFilter } from "./period-filter-context";
import { Colaborador, Meta, Venda } from "@/data/mock-data";

interface NotificacaoConfig {
  gatilhoMeta: {
    ativo: boolean;
    percentual: number;
    mensagem: string;
  };
  gatilhoData: {
    ativo: boolean;
    diasAntes: number;
    mensagem: string;
  };
}

interface NotificacaoContextType {
  config: NotificacaoConfig;
  updateConfig: (newConfig: NotificacaoConfig) => void;
  simularEnvio: () => Promise<void>;
  // ATUALIZAMOS A "ASSINATURA" DA FUNÇÃO PARA RECEBER A LISTA DE COLABORADORES
  checkAndSendMetaNotification: (
    colaboradorId: number,
    vendas: Venda[],
    metas: Meta[],
    colaboradores: Colaborador[]
  ) => void;
}

const NotificacaoContext = createContext<NotificacaoContextType | undefined>(
  undefined
);

const WEBHOOK_URL = "https://mvbk7zvx-n8n.cloudfy.cloud/webhook-test/teste";

export function NotificacaoProvider({ children }: { children: ReactNode }) {
  // REMOVEMOS a chamada ao useData() daqui
  const { isDateInPeriod } = usePeriodFilter();

  const [config, setConfig] = useState<NotificacaoConfig>({
    gatilhoMeta: {
      ativo: true,
      percentual: 75,
      mensagem: "Olá {nome}, você atingiu {percentual}% da sua meta!",
    },
    gatilhoData: {
      ativo: true,
      diasAntes: 7,
      mensagem: "Olá {nome}, faltam {dias} dias para o fechamento do mês!",
    },
  });

  const updateConfig = (newConfig: NotificacaoConfig) => {
    setConfig(newConfig);
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências de notificação foram atualizadas.",
    });
  };

  // ATUALIZAMOS A FUNÇÃO PARA USAR O PARÂMETRO "colaboradores"
  const checkAndSendMetaNotification = async (
    colaboradorId: number,
    vendas: Venda[],
    metas: Meta[],
    colaboradores: Colaborador[]
  ) => {
    if (!config.gatilhoMeta.ativo) return;

    const colaborador = colaboradores.find((c) => c.id === colaboradorId);
    if (!colaborador) return;

    // ... (o restante da função continua igual)
    const metaVendedor = metas.find(
      (m) =>
        m.colaboradorId === colaboradorId &&
        isDateInPeriod(m.periodo) &&
        m.tipo === "mensal"
    );
    if (!metaVendedor) return;

    const vendasVendedor = vendas.filter(
      (v) => v.colaboradorId === colaboradorId && isDateInPeriod(v.data)
    );

    const totalVendido = vendasVendedor.reduce((acc, v) => acc + v.valor, 0);
    const percentualAtingido = (totalVendido / metaVendedor.valorMeta) * 100;

    if (percentualAtingido >= config.gatilhoMeta.percentual) {
      const mensagem = config.gatilhoMeta.mensagem
        .replace("{nome}", colaborador.nome)
        .replace("{percentual}", Math.round(percentualAtingido).toString());

      try {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: colaborador.nome,
            telefone: colaborador.telefone,
            mensagem,
          }),
        });
        toast({
          title: "Notificação de Meta Atingida!",
          description: `Webhook enviado para ${colaborador.nome}.`,
        });
      } catch (error) {
        /* O erro já é tratado na simulação, aqui podemos optar por não notificar */
      }
    }
  };

  const simularEnvio = async () => {
    // A simulação pode continuar como está, pois ela não depende do useData
    // Se precisasse, você teria que buscar os colaboradores de outra forma
    // ou passar como parâmetro também.
  };

  return (
    <NotificacaoContext.Provider
      value={{
        config,
        updateConfig,
        simularEnvio,
        checkAndSendMetaNotification,
      }}
    >
      {children}
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  const context = useContext(NotificacaoContext);
  if (context === undefined) {
    throw new Error("useNotificacao must be used within a NotificacaoProvider");
  }
  return context;
}
