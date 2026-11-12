
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

export interface Imagem {
  id: number;
  url: string;
  ordem: number;
  tipo: string;
  produtoId: number;
}

export interface ProdutoVariacao {
  id: number;
  sku: string;
  cor: string;
  tamanho: string;
  preco: number | string;
  status: string;
  produtoId: number;
}

export interface Estoque {
  id: number;
  quantidade: number;
  quantidade_reservada: number;
  produtoVariacaoId: number;
}

export async function listarLojas(): Promise<Loja[]> {
  return api<Loja[]>("/api/loja");
}

export async function listarProdutos(): Promise<Produto[]> {
  return api<Produto[]>("/api/produto");
}

export async function listarImagens(): Promise<Imagem[]> {
  return api<Imagem[]>("/api/imagem");
}

export async function listarVariacoes(): Promise<ProdutoVariacao[]> {
  return api<ProdutoVariacao[]>("/api/produtoVariacao");
}

export async function listarEstoques(): Promise<Estoque[]> {
  return api<Estoque[]>("/api/estoque");
}

export function imagemPrincipal(
  produtoId: number,
  imagens: Imagem[]
): string | null {
  const imagensProduto = imagens
    .filter((imagem) => Number(imagem.produtoId) === produtoId)
    .sort((a, b) => a.ordem - b.ordem);

  return imagensProduto[0]?.url ?? null;
}

export function estoqueDoProduto(
  produtoId: number,
  variacoes: ProdutoVariacao[],
  estoques: Estoque[]
): number | null {
  const ids = variacoes
    .filter((v) => Number(v.produtoId) === produtoId)
    .map((v) => v.id);

  if (ids.length === 0) return null;

  return estoques
    .filter((e) => ids.includes(Number(e.produtoVariacaoId)))
    .reduce(
      (total, estoque) =>
        total + Math.max(
          0,
          Number(estoque.quantidade) - Number(estoque.quantidade_reservada ?? 0)
        ),
      0
    );
}
