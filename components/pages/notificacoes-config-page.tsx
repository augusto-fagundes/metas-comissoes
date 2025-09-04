// Localização: metas-comissoes/components/pages/notificacoes-config-page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNotificacao, GatilhoMeta } from "@/contexts/notificacao-context";
import { Bot, Send, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function NotificacoesConfigPage() {
  const {
    config: initialConfig,
    updateConfig,
    simularEnvio,
  } = useNotificacao();

  // Criamos um estado local para editar a configuração
  const [localConfig, setLocalConfig] = useState(initialConfig);

  const handleGatilhoChange = (
    id: number,
    field: keyof GatilhoMeta,
    value: string | number | boolean
  ) => {
    const novosGatilhos = localConfig.gatilhosMeta.map((g) =>
      g.id === id ? { ...g, [field]: value } : g
    );
    setLocalConfig({ ...localConfig, gatilhosMeta: novosGatilhos });
  };

  const handleAdicionarGatilho = () => {
    const novoGatilho: GatilhoMeta = {
      id: Date.now(), // ID único baseado no timestamp
      ativo: true,
      percentual: 100,
      mensagem: "Parabéns {nome}, você bateu a meta! 🎉 ({percentual}%)",
    };
    setLocalConfig({
      ...localConfig,
      gatilhosMeta: [...localConfig.gatilhosMeta, novoGatilho],
    });
  };

  const handleRemoverGatilho = (id: number) => {
    const novosGatilhos = localConfig.gatilhosMeta.filter((g) => g.id !== id);
    setLocalConfig({ ...localConfig, gatilhosMeta: novosGatilhos });
  };

  const handleSaveChanges = () => {
    updateConfig(localConfig);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automações de Notificação</h1>
          <p className="text-gray-600">
            Automatize o envio de mensagens via WhatsApp para sua equipe.
          </p>
        </div>
        <Button onClick={simularEnvio}>
          <Send className="w-4 h-4 mr-2" />
          Simular Envio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disparos por Metas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Disparos Baseados em Metas</CardTitle>
            <CardDescription>
              Envie mensagens quando um vendedor atingir certas porcentagens da
              meta. Você pode criar múltiplos gatilhos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {localConfig.gatilhosMeta.map((gatilho, index) => (
              <div key={gatilho.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold">Gatilho #{index + 1}</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`meta-ativo-${gatilho.id}`}
                        checked={gatilho.ativo}
                        onCheckedChange={(checked) =>
                          handleGatilhoChange(gatilho.id, "ativo", checked)
                        }
                      />
                      <Label htmlFor={`meta-ativo-${gatilho.id}`}>Ativo</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverGatilho(gatilho.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor={`meta-percentual-${gatilho.id}`}>
                      Enviar quando atingir (%)
                    </Label>
                    <Input
                      id={`meta-percentual-${gatilho.id}`}
                      type="number"
                      value={gatilho.percentual}
                      onChange={(e) =>
                        handleGatilhoChange(
                          gatilho.id,
                          "percentual",
                          Number(e.target.value)
                        )
                      }
                      disabled={!gatilho.ativo}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`meta-mensagem-${gatilho.id}`}>
                      Mensagem
                    </Label>
                    <Textarea
                      id={`meta-mensagem-${gatilho.id}`}
                      value={gatilho.mensagem}
                      onChange={(e) =>
                        handleGatilhoChange(
                          gatilho.id,
                          "mensagem",
                          e.target.value
                        )
                      }
                      disabled={!gatilho.ativo}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAdicionarGatilho}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Gatilho por Meta
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Variáveis disponíveis: `{"{nome}"}`, `{"{percentual}"}`.
            </p>
          </CardContent>
        </Card>

        {/* Disparos por Data */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Disparos Baseados em Datas</CardTitle>
            <CardDescription>
              Envie uma mensagem de lembrete perto do fechamento do mês.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lógica para gatilho de data permanece a mesma */}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
      </div>
    </div>
  );
}
