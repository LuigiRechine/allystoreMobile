
import { useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";

import { api } from "../../services/api";
import {
  Loja,
  Produto,
  Imagem,
  ProdutoVariacao,
  Estoque,
  listarProdutos,
  listarImagens,
  listarVariacoes,
  listarEstoques,
  imagemPrincipal,
  estoqueDoProduto,
} from "../../services/catalogo";

import { useCarrinho } from "../../contexts/CarrinhoContext";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutosLoja() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { adicionar, totalItens, lojaId } = useCarrinho();

  const [loja, setLoja] = useState<Loja | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [variacoes, setVariacoes] = useState<ProdutoVariacao[]>([]);
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        setErro("");

        const [
          dadosLoja,
          todosProdutos,
          todasImagens,
          todasVariacoes,
          todosEstoques,
        ] = await Promise.all([
          api<Loja>(`/api/loja/${id}`),
          listarProdutos(),
          listarImagens(),
          listarVariacoes(),
          listarEstoques(),
        ]);

        if (!ativo) return;

        setLoja(dadosLoja);

        setProdutos(
          todosProdutos.filter(
            (produto) =>
              Number(produto.lojaId) === Number(id) &&
              produto.status?.toLowerCase() === "ativo"
          )
        );

        setImagens(todasImagens);
        setVariacoes(todasVariacoes);
        setEstoques(todosEstoques);
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Erro ao carregar produtos."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [id]);

  function adicionarProduto(produto: Produto) {
    const estoque = estoqueDoProduto(
      produto.id,
      variacoes,
      estoques
    );

    if (estoque === 0) {
      Alert.alert("Produto indisponível", "Esse produto está sem estoque.");
      return;
    }

    if (lojaId !== null && lojaId !== Number(id)) {
      Alert.alert(
        "Carrinho de outra loja",
        "Seu carrinho já possui produtos de outra loja. Finalize ou esvazie o carrinho antes de comprar aqui."
      );
      return;
    }

    adicionar({
      produtoId: produto.id,
      lojaId: Number(id),
      nome: produto.nome,
      preco: Number(produto.preco),
      imagem: imagemPrincipal(produto.id, imagens),
      quantidade: 1,
      estoqueDisponivel: estoque,
    });

    Alert.alert("Adicionado!", `${produto.nome} foi adicionado ao carrinho.`);
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.textoSecundario}>Carregando produtos...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.erro}>{erro}</Text>
        <Pressable style={styles.botaoPrincipal} onPress={() => router.back()}>
          <Text style={styles.botaoTexto}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.voltar}>‹ Lojas</Text>
        </Pressable>

        <Pressable
          style={styles.botaoCarrinho}
          onPress={() => router.push("/carrinho")}
        >
          <Text style={styles.carrinhoTexto}>
            Carrinho ({totalItens})
          </Text>
        </Pressable>
      </View>

      <Text style={styles.titulo}>{loja?.nome}</Text>
      <Text style={styles.subtitulo}>
        {loja?.descricao || "Confira nossos produtos"}
      </Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.linha}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.textoSecundario}>
            Esta loja ainda não possui produtos disponíveis.
          </Text>
        }
        renderItem={({ item }) => {
          const imagem = imagemPrincipal(item.id, imagens);
          const estoque = estoqueDoProduto(
            item.id,
            variacoes,
            estoques
          );
          const semEstoque = estoque === 0;

          return (
            <View style={styles.card}>
              {imagem ? (
                <Image
                  source={{ uri: imagem }}
                  style={styles.imagem}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagemVazia}>
                  <Text style={styles.textoSecundario}>Sem imagem</Text>
                </View>
              )}

              <View style={styles.cardConteudo}>
                <Text style={styles.nome} numberOfLines={2}>
                  {item.nome}
                </Text>

                <Text style={styles.descricao} numberOfLines={2}>
                  {item.descricao || "Confira este produto."}
                </Text>

                <Text style={styles.preco}>
                  {moeda(Number(item.preco))}
                </Text>

                {semEstoque && (
                  <Text style={styles.esgotado}>Esgotado</Text>
                )}

                <Pressable
                  style={[
                    styles.botaoAdicionar,
                    semEstoque && styles.botaoDesabilitado,
                  ]}
                  disabled={semEstoque}
                  onPress={() => adicionarProduto(item)}
                >
                  <Text style={styles.botaoTexto}>
                    {semEstoque ? "Indisponível" : "Adicionar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingTop: 55,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    gap: 12,
  },
  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  voltar: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoCarrinho: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  carrinhoTexto: {
    color: "#4338CA",
    fontWeight: "700",
  },
  titulo: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitulo: {
    color: "#64748B",
    marginTop: 5,
    marginBottom: 22,
  },
  lista: {
    paddingBottom: 35,
  },
  linha: {
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imagem: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#E2E8F0",
  },
  imagemVazia: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardConteudo: {
    padding: 12,
  },
  nome: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
    minHeight: 38,
  },
  descricao: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 5,
    minHeight: 28,
  },
  preco: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 10,
  },
  esgotado: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 7,
  },
  botaoAdicionar: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    padding: 11,
    alignItems: "center",
  },
  botaoDesabilitado: {
    backgroundColor: "#94A3B8",
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  textoSecundario: {
    color: "#64748B",
  },
  erro: {
    color: "#DC2626",
    textAlign: "center",
  },
  botaoPrincipal: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 10,
  },
});
