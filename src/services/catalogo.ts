
import { api } from "./api";

export interface Loja {
  id: number;
  nome: string;
  slug: string;
  logo: string | null;
  descricao: string | null;
  status: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number | string;
  status: string;
  destaque: boolean;
  categoriaId: number;
  lojaId: number;
}

export async function listarLojas(): Promise<Loja[]> {
  return api<Loja[]>("/api/loja");
}

export async function listarProdutos(): Promise<Produto[]> {
  return api<Produto[]>("/api/produto");
}
