// Localização: metas-comissoes/contexts/notificacao-context.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
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
  checkAndSendMetaNotification: (
    colaboradorId: number,
    vendasAtuais: Venda[],
    vendasAnteriores: Venda[],
    metas: Meta[],
    colaboradores: Colaborador[]
  ) => void;
}

const NotificacaoContext = createContext<NotificacaoContextType | undefined>(
  undefined
);

const WEBHOOK_URL = "https://mvbk7zvx-n8n.cloudfy.cloud/webhook-test/teste";

export function NotificacaoProvider({ children }: { children: ReactNode }) {
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

  const checkAndSendMetaNotification = async (
    colaboradorId: number,
    vendasAtuais: Venda[],
    vendasAnteriores: Venda[],
    metas: Meta[],
    colaboradores: Colaborador[]
  ) => {
    if (!config.gatilhoMeta.ativo) return;

    const colaborador = colaboradores.find((c) => c.id === colaboradorId);
    if (!colaborador) return;

    const metaVendedor = metas.find(
      (m) =>
        m.colaboradorId === colaboradorId &&
        isDateInPeriod(m.periodo) &&
        m.tipo === "mensal"
    );

    if (!metaVendedor || metaVendedor.valorMeta === 0) return;

    // Calcula o total vendido ANTES da nova venda
    const vendasAnterioresVendedor = vendasAnteriores.filter(
      (v) => v.colaboradorId === colaboradorId && isDateInPeriod(v.data)
    );
    const totalVendidoAntes = vendasAnterioresVendedor.reduce(
      (acc, v) => acc + v.valor,
      0
    );
    const percentualAntes = (totalVendidoAntes / metaVendedor.valorMeta) * 100;

    // Calcula o total vendido DEPOIS da nova venda
    const vendasAtuaisVendedor = vendasAtuais.filter(
      (v) => v.colaboradorId === colaboradorId && isDateInPeriod(v.data)
    );
    const totalVendidoDepois = vendasAtuaisVendedor.reduce(
      (acc, v) => acc + v.valor,
      0
    );
    const percentualDepois =
      (totalVendidoDepois / metaVendedor.valorMeta) * 100;

    const limiar = config.gatilhoMeta.percentual;

    // CONDIÇÃO: A notificação só é enviada se o percentual ANTES era MENOR que o limiar
    // E o percentual DEPOIS é MAIOR OU IGUAL ao limiar.
    if (percentualAntes < limiar && percentualDepois >= limiar) {
      const mensagem = config.gatilhoMeta.mensagem
        .replace("{nome}", colaborador.nome)
        .replace("{percentual}", Math.round(percentualDepois).toString());

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
        // Silencia o erro no toast para não poluir a interface do usuário
      }
    }
  };

  const simularEnvio = async () => {
    // Lógica de simulação pode ser mantida
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
