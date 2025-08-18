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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Users,
  Percent,
  Store,
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { toast } from "@/hooks/use-toast";
import { Loja, FormaPagamento, Usuario } from "@/data/mock-data";

export function ConfiguracoesPage() {
  const {
    formasPagamento,
    usuarios,
    lojas,
    addFormaPagamento,
    updateFormaPagamento,
    deleteFormaPagamento,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    addLoja,
    updateLoja,
    deleteLoja,
  } = useData();

  const [activeSection, setActiveSection] = useState("formas-pagamento");
  const [showFormaDialog, setShowFormaDialog] = useState(false);
  const [showUsuarioDialog, setShowUsuarioDialog] = useState(false);
  const [showLojaDialog, setShowLojaDialog] = useState(false);
  const [editingForma, setEditingForma] = useState<FormaPagamento | null>(null);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null);

  const [formaData, setFormaData] = useState({
    nome: "",
    codigo: "",
    percentualComissao: "",
    ativo: true,
  });
  const [usuarioData, setUsuarioData] = useState({
    nome: "",
    email: "",
    tipo: "",
    colaboradorId: "",
    status: "ativo",
  });
  const [lojaData, setLojaData] = useState({ nome: "" });

  const resetFormaForm = () => {
    setFormaData({ nome: "", codigo: "", percentualComissao: "", ativo: true });
    setEditingForma(null);
  };

  const resetUsuarioForm = () => {
    setUsuarioData({
      nome: "",
      email: "",
      tipo: "",
      colaboradorId: "",
      status: "ativo",
    });
    setEditingUsuario(null);
  };

  const resetLojaForm = () => {
    setLojaData({ nome: "" });
    setEditingLoja(null);
  };

  const handleFormaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const forma = {
      nome: formaData.nome,
      codigo: formaData.codigo.toUpperCase(),
      percentualComissao: Number.parseFloat(formaData.percentualComissao),
      ativo: formaData.ativo,
    };
    if (editingForma) {
      updateFormaPagamento({ ...editingForma, ...forma });
      toast({ title: "Forma de pagamento atualizada!" });
    } else {
      addFormaPagamento(forma);
      toast({ title: "Forma de pagamento criada!" });
    }
    setShowFormaDialog(false);
    resetFormaForm();
  };

  const handleUsuarioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usuario = {
      nome: usuarioData.nome,
      email: usuarioData.email,
      tipo: usuarioData.tipo as "admin" | "colaborador",
      colaboradorId: usuarioData.colaboradorId
        ? Number.parseInt(usuarioData.colaboradorId)
        : undefined,
      status: usuarioData.status,
      dataCriacao: new Date().toISOString().split("T")[0],
    };
    if (editingUsuario) {
      updateUsuario({ ...editingUsuario, ...usuario });
      toast({ title: "Usuário atualizado!" });
    } else {
      addUsuario(usuario);
      toast({ title: "Usuário criado!" });
    }
    setShowUsuarioDialog(false);
    resetUsuarioForm();
  };

  const handleLojaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLoja) {
      updateLoja({ ...editingLoja, nome: lojaData.nome });
      toast({ title: "Loja atualizada!" });
    } else {
      addLoja({ nome: lojaData.nome });
      toast({ title: "Loja criada!" });
    }
    setShowLojaDialog(false);
    resetLojaForm();
  };

  const handleEditForma = (forma: FormaPagamento) => {
    setEditingForma(forma);
    setFormaData({
      nome: forma.nome,
      codigo: forma.codigo,
      percentualComissao: String(forma.percentualComissao),
      ativo: forma.ativo,
    });
    setShowFormaDialog(true);
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setUsuarioData({
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      colaboradorId: usuario.colaboradorId ? String(usuario.colaboradorId) : "",
      status: usuario.status,
    });
    setShowUsuarioDialog(true);
  };

  const handleEditLoja = (loja: Loja) => {
    setEditingLoja(loja);
    setLojaData({ nome: loja.nome });
    setShowLojaDialog(true);
  };

  const handleDeleteForma = (id: number) => {
    if (confirm("Tem certeza?")) {
      deleteFormaPagamento(id);
      toast({ title: "Forma de pagamento excluída!" });
    }
  };

  const handleDeleteUsuario = (id: number) => {
    if (confirm("Tem certeza?")) {
      deleteUsuario(id);
      toast({ title: "Usuário excluído!" });
    }
  };

  const handleDeleteLoja = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta loja?")) {
      deleteLoja(id);
      toast({ title: "Loja excluída!" });
    }
  };

  const getStatusBadge = (status: string) =>
    status === "ativo" ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inativo</Badge>
    );

  const sections = [
    { id: "formas-pagamento", label: "Formas de Pagamento", icon: CreditCard },
    { id: "lojas", label: "Lojas", icon: Store },
    { id: "usuarios", label: "Usuários", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "ghost"}
            className="flex items-center gap-2"
            onClick={() => setActiveSection(section.id)}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </Button>
        ))}
      </div>

      {activeSection === "formas-pagamento" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Formas de Pagamento
                </CardTitle>
                <CardDescription>
                  Configure as formas de pagamento e seus percentuais de
                  comissão
                </CardDescription>
              </div>
              <Dialog open={showFormaDialog} onOpenChange={setShowFormaDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetFormaForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Forma
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingForma
                        ? "Editar Forma de Pagamento"
                        : "Nova Forma de Pagamento"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFormaSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          value={formaData.nome}
                          onChange={(e) =>
                            setFormaData({ ...formaData, nome: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="codigo">Código</Label>
                        <Input
                          id="codigo"
                          value={formaData.codigo}
                          onChange={(e) =>
                            setFormaData({
                              ...formaData,
                              codigo: e.target.value.toUpperCase(),
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentualComissao">
                        Percentual de Comissão (%)
                      </Label>
                      <Input
                        id="percentualComissao"
                        type="number"
                        step="0.1"
                        value={formaData.percentualComissao}
                        onChange={(e) =>
                          setFormaData({
                            ...formaData,
                            percentualComissao: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativo"
                        checked={formaData.ativo}
                        onCheckedChange={(checked) =>
                          setFormaData({ ...formaData, ativo: checked })
                        }
                      />
                      <Label htmlFor="ativo">Ativa</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFormaDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingForma ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Percentual de Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formasPagamento.map((forma) => (
                  <TableRow key={forma.id}>
                    <TableCell className="font-medium">{forma.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{forma.codigo}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {forma.percentualComissao}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {forma.ativo
                        ? getStatusBadge("ativo")
                        : getStatusBadge("inativo")}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditForma(forma)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteForma(forma.id)}
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
      )}

      {activeSection === "lojas" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" /> Lojas
                </CardTitle>
                <CardDescription>
                  Gerencie as lojas ou filiais da sua empresa
                </CardDescription>
              </div>
              <Dialog open={showLojaDialog} onOpenChange={setShowLojaDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetLojaForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Loja
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingLoja ? "Editar Loja" : "Nova Loja"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLojaSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeLoja">Nome da Loja</Label>
                      <Input
                        id="nomeLoja"
                        value={lojaData.nome}
                        onChange={(e) =>
                          setLojaData({ ...lojaData, nome: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLojaDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingLoja ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lojas.map((loja) => (
                  <TableRow key={loja.id}>
                    <TableCell className="font-medium">{loja.nome}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditLoja(loja)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLoja(loja.id)}
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
      )}

      {activeSection === "usuarios" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Usuários do Sistema
                </CardTitle>
                <CardDescription>
                  Gerencie os usuários que têm acesso ao sistema
                </CardDescription>
              </div>
              <Dialog
                open={showUsuarioDialog}
                onOpenChange={setShowUsuarioDialog}
              >
                <DialogTrigger asChild>
                  <Button onClick={resetUsuarioForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingUsuario ? "Editar Usuário" : "Novo Usuário"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUsuarioSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeUsuario">Nome</Label>
                        <Input
                          id="nomeUsuario"
                          value={usuarioData.nome}
                          onChange={(e) =>
                            setUsuarioData({
                              ...usuarioData,
                              nome: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailUsuario">Email</Label>
                        <Input
                          id="emailUsuario"
                          type="email"
                          value={usuarioData.email}
                          onChange={(e) =>
                            setUsuarioData({
                              ...usuarioData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoUsuario">Tipo de Usuário</Label>
                      <Select
                        value={usuarioData.tipo}
                        onValueChange={(value) =>
                          setUsuarioData({ ...usuarioData, tipo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="colaborador">
                            Colaborador
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="statusUsuario">Status</Label>
                      <Select
                        value={usuarioData.status}
                        onValueChange={(value) =>
                          setUsuarioData({ ...usuarioData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowUsuarioDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingUsuario ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.nome}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          usuario.tipo === "admin" ? "default" : "outline"
                        }
                      >
                        {usuario.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(usuario.status)}</TableCell>
                    <TableCell>
                      {new Date(usuario.dataCriacao).toLocaleDateString(
                        "pt-BR"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUsuario(usuario)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUsuario(usuario.id)}
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
      )}
    </div>
  );
}
