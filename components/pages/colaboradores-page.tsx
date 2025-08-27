"use client";

import React, { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  Store,
  Upload,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { toast } from "@/hooks/use-toast";
import { Colaborador } from "@/data/mock-data";
import { Checkbox } from "@/components/ui/checkbox";

export function ColaboradoresPage() {
  const {
    colaboradores,
    lojas,
    usuarios,
    addColaborador,
    updateColaborador,
    deleteColaborador,
  } = useData();
  const [showDialog, setShowDialog] = useState(false);
  const [editingColaborador, setEditingColaborador] =
    useState<Colaborador | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    lojaId: "",
    cargo: "",
    foto: "",
    temAcesso: false,
    tipo: "vendedor",
    password: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      lojaId: "",
      cargo: "",
      foto: "",
      temAcesso: false,
      tipo: "vendedor",
      password: "",
    });
    setEditingColaborador(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.temAcesso) {
      if (!formData.tipo) {
        toast({
          title: "Erro",
          description: "O tipo de acesso é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      if (!editingColaborador && formData.password.length < 3) {
        toast({
          title: "Senha curta",
          description: "A senha de acesso deve ter no mínimo 3 caracteres.",
          variant: "destructive",
        });
        return;
      }
    }

    const colaboradorData = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      lojaId: Number(formData.lojaId),
      cargo: formData.cargo,
      tipo: formData.tipo as "vendedor" | "admin" | "gerente",
      foto: formData.foto,
    };

    if (editingColaborador) {
      const acesso = {
        criar: formData.temAcesso,
        tipo: formData.tipo as "admin" | "colaborador" | "gerente",
      };
      updateColaborador({ ...editingColaborador, ...colaboradorData }, acesso);
      toast({ title: "Colaborador atualizado!" });
    } else {
      const userData = formData.temAcesso
        ? {
            tipo: formData.tipo,
          }
        : undefined;
      addColaborador(colaboradorData, userData);
      toast({ title: "Colaborador criado com sucesso!" });
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (colaborador: Colaborador) => {
    const usuarioVinculado = usuarios.find(
      (u) => u.colaboradorId === colaborador.id
    );
    setEditingColaborador(colaborador);
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      telefone: colaborador.telefone,
      lojaId: String(colaborador.lojaId),
      cargo: colaborador.cargo,
      foto: colaborador.foto || "",
      temAcesso: !!usuarioVinculado,
      tipo: colaborador.tipo,
      password: "",
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este colaborador e seu usuário de acesso?"
      )
    ) {
      deleteColaborador(id);
      toast({
        title: "Colaborador excluído!",
        description: "O colaborador foi removido do sistema.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "ativo" ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inativo</Badge>
    );
  };

  const getLojaNome = (lojaId: number) =>
    lojas.find((l) => l.id === lojaId)?.nome || "N/A";

  const getTipoAcesso = (colaborador: Colaborador) => {
    const usuario = usuarios.find((u) => u.colaboradorId === colaborador.id);
    return usuario ? (
      <Badge variant="secondary" className="capitalize">
        {colaborador.tipo}
      </Badge>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-gray-600">
            Gerencie a equipe de vendas e seus acessos
          </p>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do colaborador. Se necessário, conceda acesso
                ao sistema.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Label>Foto</Label>
                  <Avatar className="h-20 w-20 mt-2">
                    <AvatarImage
                      src={formData.foto || "/placeholder-user.jpg"}
                      alt="Avatar do Colaborador"
                    />
                    <AvatarFallback>
                      <Users />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    Alterar
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-grow space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) =>
                      setFormData({ ...formData, cargo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lojaId">Loja</Label>
                <Select
                  value={formData.lojaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, lojaId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {lojas.map((loja) => (
                      <SelectItem key={loja.id} value={String(loja.id)}>
                        {loja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="temAcesso"
                    checked={formData.temAcesso}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, temAcesso: !!checked })
                    }
                  />
                  <Label htmlFor="temAcesso" className="font-semibold">
                    Conceder Acesso ao Sistema
                  </Label>
                </div>

                {formData.temAcesso && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Acesso</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) =>
                          setFormData({ ...formData, tipo: value })
                        }
                        required={formData.temAcesso}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendedor">Vendedor</SelectItem>
                          <SelectItem value="gerente">Gerente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {editingColaborador
                          ? "Nova Senha (opcional)"
                          : "Senha de Acesso"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required={formData.temAcesso && !editingColaborador}
                        placeholder={
                          editingColaborador
                            ? "Deixe em branco para manter a atual"
                            : ""
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingColaborador ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
          <CardDescription>
            Gerencie todos os colaboradores e seus níveis de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores.map((colaborador) => (
                <TableRow key={colaborador.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={colaborador.foto || "/placeholder-user.jpg"}
                          alt={colaborador.nome}
                        />
                        <AvatarFallback>
                          {colaborador.nome
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{colaborador.nome}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {colaborador.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {colaborador.telefone}
                    </div>
                  </TableCell>
                  <TableCell>{getTipoAcesso(colaborador)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getLojaNome(colaborador.lojaId)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(colaborador.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(colaborador)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(colaborador.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
