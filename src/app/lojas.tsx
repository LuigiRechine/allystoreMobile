
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { listarLojas, Loja } from "../services/catalogo";

export default function Lojas() {
    const router = useRouter();

    const [lojas, setLojas] = useState<Loja[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregarLojas() {
        try {
            setErro("");
            const dados = await listarLojas();

            setLojas(
                dados.filter((loja) => loja.status?.toLowerCase() === "ativo")
            );
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Erro ao carregar lojas."
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarLojas();
    }, []);

    if (carregando) {
        return (
            <View style={styles.centralizado}>
                <ActivityIndicator size="large" color="#222" />
                <Text style={styles.subtitulo}>Carregando lojas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>AllyStore</Text>
            <Text style={styles.subtitulo}>
                Encontre sua próxima loja favorita.
            </Text>

            <Pressable
                style={styles.botaoPedidos}
                onPress={() => router.push("/pedidos")}
            >
                <Text style={styles.botaoPedidosTexto}>
                    Meus pedidos
                </Text>
            </Pressable>

            <Pressable
                onPress={() => router.push("/logout")}
                style={styles.botaoLogout}
            >
                <Text style={styles.textoLogout}>Sair da conta</Text>
            </Pressable>

            {erro ? (
                <Pressable onPress={carregarLojas}>
                    <Text style={styles.erro}>{erro} — Tentar novamente</Text>
                </Pressable>
            ) : (
                <FlatList
                    data={lojas}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.lista}
                    ListEmptyComponent={
                        <Text>Nenhuma loja disponível no momento.</Text>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: "/loja/[id]",
                                    params: { id: String(item.id) },
                                })
                            }
                        >
                            <View style={styles.logo}>
                                <Text style={styles.logoTexto}>
                                    {item.nome.charAt(0).toUpperCase()}
                                </Text>
                            </View>

                            <View style={styles.info}>
                                <Text style={styles.nome}>{item.nome}</Text>
                                <Text style={styles.descricao}>
                                    {item.descricao || "Confira os produtos desta loja"}
                                </Text>
                            </View>

                            <Text style={styles.seta}>›</Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 22,
        paddingTop: 60,
    },
    centralizado: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    titulo: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#171717",
    },
    subtitulo: {
        fontSize: 15,
        color: "#777",
        marginTop: 6,
        marginBottom: 25,
    },
    lista: {
        gap: 12,
        paddingBottom: 25,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
    },
    logo: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center",
    },
    logoTexto: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    info: {
        flex: 1,
    },
    nome: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#222",
    },
    descricao: {
        fontSize: 13,
        color: "#777",
        marginTop: 4,
    },
    seta: {
        fontSize: 28,
        color: "#999",
    },
    erro: {
        color: "red",
        marginTop: 20,
    },
    botaoPedidos: {
        alignSelf: "flex-start",
        backgroundColor: "#E0E7FF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 18,
    },
    botaoPedidosTexto: {
        color: "#4338CA",
        fontWeight: "700",
    },
    botaoLogout: {
        alignSelf: "flex-start",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: "#FEE2E2",
        marginBottom: 15,
    },
    textoLogout: {
        color: "#DC2626",
        fontWeight: "700",
    },
});
