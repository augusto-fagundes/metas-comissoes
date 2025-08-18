"use client";

import type React from "react";

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
  Calendar,
  Store,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { toast } from "@/hooks/use-toast";
import { Colaborador } from "@/data/mock-data";

export function ColaboradoresPage() {
  const {
    colaboradores,
    lojas,
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
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      lojaId: "",
      cargo: "",
    });
    setEditingColaborador(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const colaboradorData = {
      ...formData,
      lojaId: Number(formData.lojaId),
      dataAdmissao:
        editingColaborador?.dataAdmissao ||
        new Date().toISOString().split("T")[0],
      status: editingColaborador?.status || ("ativo" as const),
    };

    if (editingColaborador) {
      updateColaborador({ ...editingColaborador, ...colaboradorData });
      toast({
        title: "Colaborador atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    } else {
      addColaborador(colaboradorData);
      toast({
        title: "Colaborador adicionado!",
        description: "Novo colaborador foi cadastrado com sucesso.",
      });
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      telefone: colaborador.telefone,
      lojaId: String(colaborador.lojaId),
      cargo: colaborador.cargo,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este colaborador?")) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-gray-600">Gerencie a equipe de vendas</p>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}
              </DialogTitle>
              <DialogDescription>
                {editingColaborador
                  ? "Atualize as informações do colaborador"
                  : "Adicione um novo colaborador à equipe"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Nome do colaborador"
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
                    placeholder="email@empresa.com"
                    required
                  />
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
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select
                    value={formData.cargo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, cargo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendedor">Vendedor</SelectItem>
                      <SelectItem value="Vendedor Sênior">
                        Vendedor Sênior
                      </SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lojaId">Loja</Label>
                <Select
                  value={formData.lojaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, lojaId: value })
                  }
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

              <div className="flex justify-end space-x-2">
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

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Colaboradores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colaboradores.length}</div>
            <p className="text-xs text-muted-foreground">
              {colaboradores.filter((c) => c.status === "ativo").length} ativos
            </p>
          </CardContent>
        </Card>

        {lojas.slice(0, 3).map((loja) => (
          <Card key={loja.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{loja.nome}</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {colaboradores.filter((c) => c.lojaId === loja.id).length}
              </div>
              <p className="text-xs text-muted-foreground">colaboradores</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
          <CardDescription>
            Gerencie todos os colaboradores da equipe de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Admissão</TableHead>
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
                          src={colaborador.foto || "/placeholder.svg"}
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
                  <TableCell>
                    <Badge variant="outline">
                      {getLojaNome(colaborador.lojaId)}
                    </Badge>
                  </TableCell>
                  <TableCell>{colaborador.cargo}</TableCell>
                  <TableCell>{getStatusBadge(colaborador.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(colaborador.dataAdmissao).toLocaleDateString(
                        "pt-BR"
                      )}
                    </div>
                  </TableCell>
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
