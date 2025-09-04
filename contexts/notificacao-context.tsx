// Localização: metas-comissoes/contexts/notificacao-context.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { usePeriodFilter } from "./period-filter-context";
import { Colaborador, Meta, Venda } from "@/data/mock-data";

// Nova interface para um único gatilho
export interface GatilhoMeta {
  id: number;
  ativo: boolean;
  percentual: number;
  mensagem: string;
}

interface NotificacaoConfig {
  // Alterado para um array de gatilhos
  gatilhosMeta: GatilhoMeta[];
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

  // Estado para rastrear notificações já enviadas (evita repetição)
  const [sentNotifications, setSentNotifications] = useState<string[]>([]);

  const [config, setConfig] = useState<NotificacaoConfig>({
    // Alterado para um array
    gatilhosMeta: [
      {
        id: 1,
        ativo: true,
        percentual: 75,
        mensagem: "Olá {nome}, você atingiu {percentual}% da sua meta!",
      },
    ],
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
    const colaborador = colaboradores.find((c) => c.id === colaboradorId);
    if (!colaborador) return;

    const metaVendedor = metas.find(
      (m) =>
        m.colaboradorId === colaboradorId &&
        isDateInPeriod(m.periodo) &&
        m.tipo === "mensal"
    );

    if (!metaVendedor || metaVendedor.valorMeta === 0) return;

    const totalVendidoAntes = vendasAnteriores
      .filter(
        (v) => v.colaboradorId === colaboradorId && isDateInPeriod(v.data)
      )
      .reduce((acc, v) => acc + v.valor, 0);
    const percentualAntes = (totalVendidoAntes / metaVendedor.valorMeta) * 100;

    const totalVendidoDepois = vendasAtuais
      .filter(
        (v) => v.colaboradorId === colaboradorId && isDateInPeriod(v.data)
      )
      .reduce((acc, v) => acc + v.valor, 0);
    const percentualDepois =
      (totalVendidoDepois / metaVendedor.valorMeta) * 100;

    // Itera sobre todos os gatilhos configurados
    config.gatilhosMeta.forEach(async (gatilho) => {
      if (!gatilho.ativo) return;

      const notificationKey = `${colaborador.id}-${metaVendedor.periodo}-${gatilho.id}`;

      // Se a notificação para este gatilho já foi enviada neste período, não envia de novo
      if (sentNotifications.includes(notificationKey)) {
        return;
      }

      const limiar = gatilho.percentual;

      if (percentualAntes < limiar && percentualDepois >= limiar) {
        const mensagem = gatilho.mensagem
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
            title: `Notificação de ${limiar}% Atingida!`,
            description: `Webhook enviado para ${colaborador.nome}.`,
          });
          // Adiciona a notificação à lista de enviadas
          setSentNotifications((prev) => [...prev, notificationKey]);
        } catch (error) {
          // Erro silencioso
        }
      }
    });
  };

  const simularEnvio = async () => {
    /* ... */
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
