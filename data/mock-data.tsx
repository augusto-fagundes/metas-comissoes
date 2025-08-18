export interface Colaborador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  lojaId: number;
  dataAdmissao: string;
  status: "ativo" | "inativo";
  foto?: string;
}

export interface Loja {
  id: number;
  nome: string;
  // O campo 'status' foi removido
}

export interface Meta {
  id: number;
  colaboradorId: number;
  periodo: string;
  valorMeta: number;
  descricao: string;
  status: "ativa" | "inativa";
}

// ... (O restante das interfaces Venda, FormaPagamento, etc., não muda)
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

// ... (O restante dos dados como 'colaboradores', 'metas', etc., não precisa de alterações aqui)
export const colaboradores: Colaborador[] = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@empresa.com",
    telefone: "(11) 99999-0001",
    cargo: "Vendedor",
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
    lojaId: 2,
    dataAdmissao: "2023-03-05",
    status: "ativo",
  },
];

export const metas: Meta[] = [
  {
    id: 1,
    colaboradorId: 1,
    periodo: "2024-01",
    valorMeta: 50000,
    descricao: "Meta de vendas para Janeiro 2024",
    status: "ativa",
  },
  {
    id: 2,
    colaboradorId: 2,
    periodo: "2024-01",
    valorMeta: 40000,
    descricao: "Meta de vendas para Janeiro 2024",
    status: "ativa",
  },
  {
    id: 3,
    colaboradorId: 3,
    periodo: "2024-01",
    valorMeta: 60000,
    descricao: "Meta de vendas para Janeiro 2024",
    status: "ativa",
  },
  {
    id: 4,
    colaboradorId: 4,
    periodo: "2024-01",
    valorMeta: 35000,
    descricao: "Meta de vendas para Janeiro 2024",
    status: "ativa",
  },
];

export const vendas: Venda[] = [
  {
    id: 1,
    colaboradorId: 1,
    cliente: "Empresa ABC Ltda",
    valor: 15000,
    data: "2024-01-15",
    formaPagamento: "PIX",
    status: "confirmada",
    observacoes: "Venda realizada via indicação",
  },
  {
    id: 2,
    colaboradorId: 1,
    cliente: "Comércio XYZ",
    valor: 8500,
    data: "2024-01-20",
    formaPagamento: "CARTAO",
    status: "confirmada",
  },
  {
    id: 3,
    colaboradorId: 2,
    cliente: "Indústria 123",
    valor: 22000,
    data: "2024-01-18",
    formaPagamento: "BOLETO",
    status: "confirmada",
  },
];

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

export const comissoes: Comissao[] = [
  {
    id: 1,
    colaboradorId: 1,
    periodo: "2024-01",
    valorComissao: 2895,
    status: "pendente",
    dataCalculo: "2024-02-01",
    detalhes: [],
  },
];
