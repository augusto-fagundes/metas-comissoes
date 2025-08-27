"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { toast } from "@/hooks/use-toast";
import { Users, Mail, Phone, Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, changePassword } = useAuth();
  const { colaboradores, lojas } = useData();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const colaborador = useMemo(() => {
    if (!user?.colaboradorId) return null;
    return colaboradores.find((c) => c.id === user.colaboradorId);
  }, [user, colaboradores]);

  const loja = useMemo(() => {
    if (!colaborador?.lojaId) return null;
    return lojas.find((l) => l.id === colaborador.lojaId);
  }, [colaborador, lojas]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro ao alterar senha",
        description: "As novas senhas não coincidem.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const success = await changePassword(
      user?.email || "",
      currentPassword,
      newPassword
    );

    if (success) {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      onOpenChange(false);
    } else {
      toast({
        title: "Erro ao alterar senha",
        description: "Senha atual incorreta.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Informações do Usuário</DialogTitle>
          <DialogDescription>
            Visualize suas informações e altere sua senha.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={colaborador?.foto || "/placeholder-user.jpg"}
                alt={user.nome}
              />
              <AvatarFallback className="text-3xl">
                {user.nome
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center font-semibold text-lg">{user.nome}</div>
            <div className="text-sm text-muted-foreground">
              {user.tipo === "admin" ? "Administrador" : "Colaborador"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={user.nome} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            {colaborador && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={colaborador.telefone} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input value={colaborador.cargo} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Loja</Label>
                  <Input value={loja?.nome || "N/A"} disabled />
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alterar Senha</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Senha"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
