
import { api } from "./api";

export interface Pedido {
  id: number;
  status: string;
  clienteId: number;
  lojaId: number;
  data?: string;
}

export interface Pagamento {
  id: number;
  valor: number | string;
  metodo: string;
  status: string;
  codigoTransacao: string;
  pedidoId: number;
}

export async function criarPedido(
  clienteId: number,
  lojaId: number
): Promise<Pedido> {
  return api<Pedido>("/api/pedido", {
    method: "POST",
    body: JSON.stringify({
      status: "novo",
      clienteId,
      lojaId,
    }),
  });
}

export async function adicionarProdutoPedido(
  pedidoId: number,
  produtoId: number,
  quantidade: number,
  preco: number
) {
  return api("/api/produtoPedido", {
    method: "POST",
    body: JSON.stringify({
      quantidade,
      preco_unitario: preco,
      subtotal: preco * quantidade,
      pedidoId,
      produtoId,
    }),
  });
}

export async function criarPagamento(
  pedidoId: number,
  valor: number,
  metodo: string
): Promise<Pagamento> {
  const codigoTransacao =
    `ALS-${pedidoId}-${Date.now().toString(36).toUpperCase()}`;

  return api<Pagamento>("/api/pagamento", {
    method: "POST",
    body: JSON.stringify({
      valor,
      metodo,
      status: "pendente",
      codigoTransacao,
      pedidoId,
    }),
  });
}

export async function buscarPedido(id: number | string) {
  return api<Pedido>(`/api/pedido/${id}`);
}

export async function listarPagamentos() {
  return api<Pagamento[]>("/api/pagamento");
}

export async function atualizarPagamento(pagamento: Pagamento) {
  return api<Pagamento>(`/api/pagamento/${pagamento.id}`, {
    method: "PUT",
    body: JSON.stringify({
      valor: pagamento.valor,
      metodo: pagamento.metodo,
      status: "aprovado",
      codigoTransacao: pagamento.codigoTransacao,
      pedidoId: pagamento.pedidoId,
    }),
  });
}

export async function atualizarPedido(pedido: Pedido) {
  return api<Pedido>(`/api/pedido/${pedido.id}`, {
    method: "PUT",
    body: JSON.stringify({
      status: "pago",
      clienteId: pedido.clienteId,
      lojaId: pedido.lojaId,
    }),
  });
}
