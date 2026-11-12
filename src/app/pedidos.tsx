
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { api } from "../services/api";
import { Pedido } from "../services/pedidos";
import { useAuth } from "../contexts/AuthContext";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function statusTexto(status: string) {
  const textos: Record<string, string> = {
    novo: "Aguardando pagamento",
    pago: "Pago",
    preparacao: "Em preparação",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };

  return textos[status] ?? status;
}

export default function PedidosScreen() {
  const router = useRouter();
  const { perfil } = useAuth();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      setErro("");

      const todos = await api<Pedido[]>("/api/pedido");

      const clientesIds = (perfil?.clientes ?? []).map(
        (cliente) => Number(cliente.id)
      );

      const meusPedidos = todos
        .filter((pedido) =>
          clientesIds.includes(Number(pedido.clienteId))
        )
        .sort(
          (a, b) =>
            Number(b.id) - Number(a.id)
        );

      setPedidos(meusPedidos);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar pedidos."
      );
    } finally {
      setCarregando(false);
    }
  }, [perfil]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.secundario}>Carregando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.replace("/lojas")}>
        <Text style={styles.voltar}>‹ Voltar às lojas</Text>
      </Pressable>

      <Text style={styles.titulo}>Meus pedidos</Text>
      <Text style={styles.secundario}>
        Acompanhe suas compras no AllyStore.
      </Text>

      {erro ? (
        <Pressable onPress={carregar}>
          <Text style={styles.erro}>{erro} — Tentar novamente</Text>
        </Pressable>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Text style={styles.emoji}>📦</Text>
              <Text style={styles.vazioTitulo}>
                Você ainda não fez pedidos
              </Text>
              <Text style={styles.secundario}>
                Quando realizar uma compra, ela aparecerá aqui.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.linha}>
                <Text style={styles.numero}>
                  Pedido #{item.id}
                </Text>

                <Text
                  style={[
                    styles.status,
                    item.status === "pago" && styles.statusPago,
                    item.status === "cancelado" && styles.statusCancelado,
                  ]}
                >
                  {statusTexto(item.status)}
                </Text>
              </View>

              <Text style={styles.data}>
                {item.data
                  ? new Date(item.data).toLocaleDateString("pt-BR")
                  : "Data não informada"}
              </Text>

              <Text style={styles.loja}>
                Loja #{item.lojaId}
              </Text>

              {item.status === "novo" && (
                <Pressable
                  style={styles.botaoPagar}
                  onPress={() =>
                    router.push({
                      pathname: "/pagamento/[pedidoId]",
                      params: { pedidoId: String(item.id) },
                    })
                  }
                >
                  <Text style={styles.botaoTexto}>
                    Continuar pagamento
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 55,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  voltar: {
    color: "#4F46E5",
    fontWeight: "700",
    marginBottom: 20,
  },
  titulo: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "900",
  },
  secundario: {
    color: "#64748B",
    marginTop: 6,
  },
  lista: {
    paddingVertical: 20,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  linha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  numero: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  status: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: "700",
  },
  statusPago: {
    color: "#047857",
    backgroundColor: "#D1FAE5",
  },
  statusCancelado: {
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
  },
  data: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 12,
  },
  loja: {
    color: "#475569",
    marginTop: 5,
    fontSize: 13,
  },
  botaoPagar: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  vazio: {
    alignItems: "center",
    paddingTop: 80,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  vazioTitulo: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 18,
  },
  erro: {
    color: "#DC2626",
    marginTop: 20,
  },
});
