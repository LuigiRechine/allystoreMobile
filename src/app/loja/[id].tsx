
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../services/api";
import {
  listarProdutos,
  Loja,
  Produto,
} from "../../services/catalogo";

export default function ProdutosLoja() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loja, setLoja] = useState<Loja | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const [dadosLoja, todosProdutos] = await Promise.all([
          api<Loja>(`/api/loja/${id}`),
          listarProdutos(),
        ]);

        setLoja(dadosLoja);

        setProdutos(
          todosProdutos.filter(
            (produto) =>
              Number(produto.lojaId) === Number(id) &&
              produto.status?.toLowerCase() === "ativo"
          )
        );
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar produtos."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id]);

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" />
        <Text>Carregando produtos...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centralizado}>
        <Text>{erro}</Text>
        <Pressable onPress={() => router.back()}>
          <Text>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.voltar}>‹ Voltar às lojas</Text>
      </Pressable>

      <Text style={styles.titulo}>{loja?.nome}</Text>
      <Text style={styles.subtitulo}>
        {loja?.descricao || "Produtos disponíveis"}
      </Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text>Esta loja ainda não possui produtos disponíveis.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.descricao}>{item.descricao}</Text>

            <Text style={styles.preco}>
              {Number(item.preco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>

            <Pressable
              style={styles.botao}
              onPress={() => {
                // Na próxima etapa vamos adicionar ao carrinho.
              }}
            >
              <Text style={styles.botaoTexto}>Adicionar ao carrinho</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 22,
    paddingTop: 55,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  voltar: {
    color: "#555",
    fontSize: 15,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#171717",
  },
  subtitulo: {
    color: "#777",
    marginTop: 5,
    marginBottom: 22,
  },
  lista: {
    gap: 13,
    paddingBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 17,
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  descricao: {
    color: "#777",
    marginTop: 5,
  },
  preco: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 13,
  },
  botao: {
    backgroundColor: "#222",
    borderRadius: 9,
    padding: 13,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
