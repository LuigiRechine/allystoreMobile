
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCarrinho } from "../contexts/CarrinhoContext";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CarrinhoScreen() {
  const router = useRouter();

  const {
    itens,
    subtotal,
    totalItens,
    carregado,
    alterarQuantidade,
    remover,
  } = useCarrinho();

  if (!carregado) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.voltar}>‹ Voltar</Text>
        </Pressable>

        <Text style={styles.titulo}>Meu carrinho</Text>
        <Text style={styles.quantidade}>{totalItens} itens</Text>
      </View>

      {itens.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.emoji}>🛍️</Text>
          <Text style={styles.vazioTitulo}>Seu carrinho está vazio</Text>
          <Text style={styles.vazioTexto}>
            Explore uma loja e adicione seus produtos favoritos.
          </Text>

          <Pressable
            style={styles.botao}
            onPress={() => router.replace("/lojas")}
          >
            <Text style={styles.botaoTexto}>Explorar lojas</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={itens}
            keyExtractor={(item) => String(item.produtoId)}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {item.imagem ? (
                  <Image
                    source={{ uri: item.imagem }}
                    style={styles.imagem}
                  />
                ) : (
                  <View style={styles.imagemVazia}>
                    <Text>📦</Text>
                  </View>
                )}

                <View style={styles.info}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  <Text style={styles.preco}>{moeda(item.preco)}</Text>

                  <View style={styles.controles}>
                    <Pressable
                      style={styles.controle}
                      onPress={() =>
                        alterarQuantidade(
                          item.produtoId,
                          item.quantidade - 1
                        )
                      }
                    >
                      <Text style={styles.controleTexto}>−</Text>
                    </Pressable>

                    <Text style={styles.numero}>
                      {item.quantidade}
                    </Text>

                    <Pressable
                      style={styles.controle}
                      disabled={
                        item.estoqueDisponivel !== null &&
                        item.quantidade >= item.estoqueDisponivel
                      }
                      onPress={() =>
                        alterarQuantidade(
                          item.produtoId,
                          item.quantidade + 1
                        )
                      }
                    >
                      <Text style={styles.controleTexto}>+</Text>
                    </Pressable>

                    <Pressable
                      style={styles.remover}
                      onPress={() => remover(item.produtoId)}
                    >
                      <Text style={styles.removerTexto}>Remover</Text>
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.subtotalItem}>
                  {moeda(item.preco * item.quantidade)}
                </Text>
              </View>
            )}
          />

          <View style={styles.resumo}>
            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>Subtotal</Text>
              <Text style={styles.valorResumo}>{moeda(subtotal)}</Text>
            </View>

            <Text style={styles.aviso}>
              O desconto Pix será aplicado na finalização da compra.
            </Text>

            <Pressable
              style={styles.botao}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.botaoTexto}>
                Continuar para pagamento
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 55,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  voltar: {
    color: "#4F46E5",
    fontWeight: "600",
    marginBottom: 18,
  },
  titulo: {
    color: "#0F172A",
    fontSize: 27,
    fontWeight: "800",
  },
  quantidade: {
    color: "#64748B",
    marginTop: 5,
  },
  lista: {
    padding: 18,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  imagem: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  imagemVazia: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  nome: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },
  preco: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },
  controles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  controle: {
    width: 28,
    height: 28,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  controleTexto: {
    color: "#4338CA",
    fontSize: 18,
    fontWeight: "700",
  },
  numero: {
    color: "#0F172A",
    fontWeight: "700",
  },
  remover: {
    marginLeft: 3,
  },
  removerTexto: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "600",
  },
  subtotalItem: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 12,
  },
  resumo: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  linhaResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  textoResumo: {
    color: "#64748B",
    fontSize: 15,
  },
  valorResumo: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 18,
  },
  aviso: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 15,
  },
  botao: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  vazio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emoji: {
    fontSize: 55,
    marginBottom: 15,
  },
  vazioTitulo: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },
  vazioTexto: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
});
