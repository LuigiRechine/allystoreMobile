
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import {
  Pedido,
  Pagamento,
  buscarPedido,
  listarPagamentos,
  atualizarPagamento,
  atualizarPedido,
} from "../../services/pedidos";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PagamentoScreen() {
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  const router = useRouter();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);

      const [dadosPedido, pagamentos] = await Promise.all([
        buscarPedido(pedidoId),
        listarPagamentos(),
      ]);

      const pagamentoPedido = pagamentos
        .filter(
          (p) => Number(p.pedidoId) === Number(pedidoId)
        )
        .sort((a, b) => Number(b.id) - Number(a.id))[0];

      setPedido(dadosPedido);
      setPagamento(pagamentoPedido ?? null);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o pagamento."
      );
    } finally {
      setCarregando(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const codigoPix = pagamento
    ? `PIX-SIMULADO-${pagamento.codigoTransacao}-${Number(
        pagamento.valor
      ).toFixed(2)}`
    : "";

  async function copiarCodigo() {
    await Clipboard.setStringAsync(codigoPix);
    Alert.alert("Copiado!", "Código de demonstração copiado.");
  }

  async function simularAprovacao() {
    if (!pedido || !pagamento) return;

    setEnviando(true);

    try {
      // 1. Atualizar pagamento.
      await atualizarPagamento(pagamento);

      // 2. Atualizar pedido.
      await atualizarPedido(pedido);

      // 3. Atualizar os dados da tela.
      await carregar();

      Alert.alert(
        "Pagamento aprovado!",
        "O pedido foi marcado como pago e estará disponível no painel do lojista."
      );
    } catch (error) {
      Alert.alert(
        "Erro na aprovação",
        error instanceof Error
          ? error.message
          : "Não foi possível aprovar o pagamento."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.secundario}>Carregando pagamento...</Text>
      </View>
    );
  }

  if (!pedido || !pagamento) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.titulo}>Pagamento não encontrado</Text>
        <Pressable style={styles.botao} onPress={() => router.replace("/lojas")}>
          <Text style={styles.botaoTexto}>Voltar às lojas</Text>
        </Pressable>
      </View>
    );
  }

  const aprovado = pagamento.status === "aprovado";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.marca}>AllyStore</Text>

      <Text style={styles.titulo}>
        {aprovado ? "Pagamento aprovado!" : "Pagamento via Pix"}
      </Text>

      <Text style={styles.secundario}>
        Pedido #{pedido.id}
      </Text>

      <View style={styles.card}>
        {aprovado ? (
          <>
            <Text style={styles.icone}>✓</Text>
            <Text style={styles.aprovado}>Pagamento confirmado</Text>
            <Text style={styles.secundario}>
              Seu pedido foi atualizado para pago.
            </Text>

            <Text style={styles.valor}>
              {moeda(Number(pagamento.valor))}
            </Text>

            <Pressable
              style={styles.botao}
              onPress={() => router.replace("/pedidos")}
            >
              <Text style={styles.botaoTexto}>Acompanhar meus pedidos</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.iconePix}>▦</Text>
            <Text style={styles.instrucao}>
              Código Pix de demonstração
            </Text>

            <Text style={styles.valor}>
              {moeda(Number(pagamento.valor))}
            </Text>

            <View style={styles.codigo}>
              <Text selectable style={styles.codigoTexto}>
                {codigoPix}
              </Text>
            </View>

            <Pressable
              style={styles.botaoSecundario}
              onPress={copiarCodigo}
            >
              <Text style={styles.botaoSecundarioTexto}>
                Copiar código
              </Text>
            </Pressable>

            <View style={styles.aviso}>
              <Text style={styles.avisoTexto}>
                Este é um pagamento fictício para testes. O código não pode
                ser pago em um banco e nenhuma movimentação financeira será
                realizada.
              </Text>
            </View>

            <Pressable
              style={[
                styles.botao,
                enviando && styles.desabilitado,
              ]}
              disabled={enviando}
              onPress={simularAprovacao}
            >
              {enviando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoTexto}>
                  Simular aprovação do pagamento
                </Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 22,
    paddingTop: 55,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    gap: 15,
  },
  marca: {
    textAlign: "center",
    color: "#4F46E5",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 25,
  },
  titulo: {
    color: "#0F172A",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  secundario: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 23,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  icone: {
    color: "#059669",
    fontSize: 55,
    fontWeight: "900",
  },
  iconePix: {
    color: "#4F46E5",
    fontSize: 55,
    marginBottom: 10,
  },
  aprovado: {
    color: "#059669",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 10,
  },
  instrucao: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 16,
  },
  valor: {
    color: "#0F172A",
    fontSize: 27,
    fontWeight: "900",
    marginVertical: 22,
  },
  codigo: {
    width: "100%",
    backgroundColor: "#F1F5F9",
    padding: 15,
    borderRadius: 12,
  },
  codigoTexto: {
    color: "#334155",
    fontSize: 12,
    textAlign: "center",
  },
  botao: {
    width: "100%",
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
  },
  botaoSecundario: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#4F46E5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  botaoSecundarioTexto: {
    color: "#4F46E5",
    fontWeight: "800",
  },
  aviso: {
    width: "100%",
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
  },
  avisoTexto: {
    color: "#92400E",
    fontSize: 12,
    lineHeight: 18,
  },
  desabilitado: {
    opacity: 0.5,
  },
});
