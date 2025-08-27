export interface Colaborador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  tipo: "vendedor" | "admin" | "gerente"; // CAMPO ADICIONADO
  lojaId: number;
  dataAdmissao: string;
  status: "ativo" | "inativo";
  foto?: string;
}

export interface Loja {
  id: number;
  nome: string;
}

export interface Meta {
  id: number;
  colaboradorId?: number;
  lojaId?: number;
  periodo: string;
  valorMeta: number;
  descricao: string;
  status: "ativa" | "concluida" | "cancelada";
  tipo: "mensal" | "anual";
  recorrente: boolean;
}

export interface Venda {
  id: number;
  colaboradorId: number;
  cliente: string;
  valor: number;
  data: string;
  formaPagamento: string;
  status: "confirmada" | "pendente";
  observacoes?: string;
}

export interface FormaPagamento {
  id: number;
  codigo: string;
  nome: string;
  percentualComissao: number;
  ativo: boolean;
}

export interface Comissao {
  id: number;
  colaboradorId: number;
  periodo: string;
  valorComissao: number;
  status: "pendente" | "aprovada" | "rejeitada" | "paga";
  dataCalculo: string;
  aprovadoPor?: number;
  dataAprovacao?: string;
  observacoes?: string;
  detalhes: {
    formaPagamento: string;
    valor: number;
    comissao: number;
  }[];
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: "admin" | "colaborador";
  colaboradorId?: number;
  status: string;
  dataCriacao: string;
}

export const lojas: Loja[] = [
  { id: 1, nome: "Loja Matriz" },
  { id: 2, nome: "Filial Centro" },
  { id: 3, nome: "Filial Shopping" },
];

export const colaboradores: Colaborador[] = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@empresa.com",
    telefone: "(11) 99999-0001",
    cargo: "Vendedor",
    tipo: "vendedor", // CAMPO ADICIONADO
    lojaId: 1,
    dataAdmissao: "2023-01-15",
    status: "ativo",
  },
  {
    id: 2,
    nome: "Maria Santos",
    email: "maria@empresa.com",
    telefone: "(11) 99999-0002",
    cargo: "Vendedora",
    tipo: "vendedor", // CAMPO ADICIONADO
    lojaId: 2,
    dataAdmissao: "2023-02-20",
    status: "ativo",
  },
  {
    id: 3,
    nome: "Pedro Oliveira",
    email: "pedro@empresa.com",
    telefone: "(11) 99999-0003",
    cargo: "Vendedor Senior",
    tipo: "vendedor", // CAMPO ADICIONADO
    lojaId: 1,
    dataAdmissao: "2022-11-10",
    status: "ativo",
  },
  {
    id: 4,
    nome: "Ana Costa",
    email: "ana@empresa.com",
    telefone: "(11) 99999-0004",
    cargo: "Vendedora",
    tipo: "vendedor", // CAMPO ADICIONADO
    lojaId: 2,
    dataAdmissao: "2023-03-05",
    status: "ativo",
  },
];

export let metas: Meta[] = [];
export let vendas: Venda[] = [];

export const formasPagamento: FormaPagamento[] = [
  { id: 1, codigo: "PIX", nome: "PIX", percentualComissao: 6.0, ativo: true },
  {
    id: 2,
    codigo: "CARTAO",
    nome: "Cartão de Crédito",
    percentualComissao: 4.5,
    ativo: true,
  },
  {
    id: 3,
    codigo: "BOLETO",
    nome: "Boleto Bancário",
    percentualComissao: 3.0,
    ativo: true,
  },
];

export const usuarios: Usuario[] = [
  {
    id: 1,
    nome: "Admin User",
    email: "admin@empresa.com",
    tipo: "admin",
    status: "ativo",
    dataCriacao: "2023-01-01",
  },
  {
    id: 2,
    nome: "João Silva",
    email: "joao@empresa.com",
    tipo: "colaborador",
    colaboradorId: 1,
    status: "ativo",
    dataCriacao: "2023-01-15",
  },
];

export let comissoes: Comissao[] = [];
