"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useData } from "@/contexts/data-context";

/**
 * Conteúdo interno do painel, que busca e exibe as formas de pagamento ativas.
 */
function CommissionInfoContent() {
  const { formasPagamento } = useData();
  // Filtramos para mostrar apenas as formas de pagamento ativas
  const formasAtivas = formasPagamento.filter((f) => f.ativo);

  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        As comissões são calculadas automaticamente com base no{" "}
        <strong>percentual de cada forma de pagamento</strong> sobre o valor da
        venda:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {formasAtivas.map((forma) => (
          <div
            key={forma.id}
            className="flex justify-between items-center p-2 bg-muted/50 rounded-md border"
          >
            <span className="font-medium text-sm">{forma.nome}</span>
            <Badge variant="secondary">
              {forma.percentualComissao.toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
              })}
              %
            </Badge>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground pt-2">
        <strong>Exemplo:</strong> Uma venda de R$ 10.000 em uma forma de
        pagamento com comissão de 6% gera R$ 600 de comissão para o colaborador.
      </p>
    </div>
  );
}

/**
 * Componente principal que renderiza um Popover para desktop e um Drawer para mobile.
 */
export function CommissionInfoPanel() {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const triggerButton = (
    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
      <Info className="w-6 h-6" />
    </Button>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Como as Comissões são Calculadas</DrawerTitle>
              <DrawerDescription>
                As regras de comissão são baseadas nas formas de pagamento
                ativas no sistema.
              </DrawerDescription>
            </DrawerHeader>
            <CommissionInfoContent />
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className="w-96 mb-2" side="top" align="end">
          <div className="p-4 pb-0">
            <h4 className="font-medium leading-none">
              Como as Comissões são Calculadas
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              As regras de comissão são baseadas nas formas de pagamento ativas
              no sistema.
            </p>
          </div>
          <CommissionInfoContent />
        </PopoverContent>
      </Popover>
    </div>
  );
}
