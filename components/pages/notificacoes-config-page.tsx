// components/pages/notificacoes-config-page.tsx
"use client";

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
import { useNotificacao } from "@/contexts/notificacao-context";
import { Bot, Send } from "lucide-react";

export function NotificacoesConfigPage() {
  const { config, updateConfig, simularEnvio } = useNotificacao();

  const handleSave = () => {
    updateConfig(config);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurar Notificações</h1>
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
        <Card>
          <CardHeader>
            <CardTitle>Disparos Baseados em Metas</CardTitle>
            <CardDescription>
              Envie uma mensagem quando um vendedor atingir uma certa
              porcentagem da meta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="meta-ativo"
                checked={config.gatilhoMeta.ativo}
                onCheckedChange={(checked) =>
                  updateConfig({
                    ...config,
                    gatilhoMeta: { ...config.gatilhoMeta, ativo: checked },
                  })
                }
              />
              <Label htmlFor="meta-ativo">Ativar este gatilho</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-percentual">
                Enviar quando atingir (% da meta)
              </Label>
              <Input
                id="meta-percentual"
                type="number"
                value={config.gatilhoMeta.percentual}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    gatilhoMeta: {
                      ...config.gatilhoMeta,
                      percentual: Number(e.target.value),
                    },
                  })
                }
                disabled={!config.gatilhoMeta.ativo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-mensagem">Mensagem</Label>
              <Textarea
                id="meta-mensagem"
                value={config.gatilhoMeta.mensagem}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    gatilhoMeta: {
                      ...config.gatilhoMeta,
                      mensagem: e.target.value,
                    },
                  })
                }
                disabled={!config.gatilhoMeta.ativo}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: `{"{nome}"}`, `{"{percentual}"}`.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disparos por Data */}
        <Card>
          <CardHeader>
            <CardTitle>Disparos Baseados em Datas</CardTitle>
            <CardDescription>
              Envie uma mensagem de lembrete perto do fechamento do mês.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="data-ativo"
                checked={config.gatilhoData.ativo}
                onCheckedChange={(checked) =>
                  updateConfig({
                    ...config,
                    gatilhoData: { ...config.gatilhoData, ativo: checked },
                  })
                }
              />
              <Label htmlFor="data-ativo">Ativar este gatilho</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-dias">
                Enviar (dias antes do fim do mês)
              </Label>
              <Input
                id="data-dias"
                type="number"
                value={config.gatilhoData.diasAntes}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    gatilhoData: {
                      ...config.gatilhoData,
                      diasAntes: Number(e.target.value),
                    },
                  })
                }
                disabled={!config.gatilhoData.ativo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-mensagem">Mensagem</Label>
              <Textarea
                id="data-mensagem"
                value={config.gatilhoData.mensagem}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    gatilhoData: {
                      ...config.gatilhoData,
                      mensagem: e.target.value,
                    },
                  })
                }
                disabled={!config.gatilhoData.ativo}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: `{"{nome}"}`, `{"{dias}"}`.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </div>
  );
}
