
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../contexts/AuthContext";
import { useCarrinho } from "../contexts/CarrinhoContext";
import {
    criarPedido,
    adicionarProdutoPedido,
    criarPagamento,
} from "../services/pedidos";

function moeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export default function CheckoutScreen() {
    const router = useRouter();
    const { perfil } = useAuth();

    const {
        itens,
        lojaId,
        subtotal,
        limpar,
        carregado,
    } = useCarrinho();

    const [enviando, setEnviando] = useState(false);

    const desconto = subtotal * 0.1;
    const total = subtotal - desconto;

    async function finalizarCompra() {

        console.log("===== DIAGNÓSTICO CHECKOUT =====");

        console.log("Tipo de usuário:", perfil?.usuario?.tipo);

        console.log("Clientes recebidos:", perfil?.clientes?.map((c) => ({
            id: c.id,
            lojaId: c.lojaId,
        })));

        console.log("Loja do carrinho:", lojaId);

        console.log("Perfil completo:", perfil);

        console.log("================================");

        if (!perfil?.clientes?.length || !lojaId) {
            Alert.alert(
                "Cadastro não encontrado",
                "Não encontramos um cadastro de cliente associado a esta loja."
            );
            return;
        }

        const cliente = perfil.clientes.find(
            (c) => Number(c.lojaId) === Number(lojaId)
        );

        if (!cliente) {
            Alert.alert(
                "Cliente não associado",
                "Sua conta não possui cadastro de cliente nesta loja. Verifique seu cadastro antes de continuar."
            );
            return;
        }

        if (itens.length === 0) {
            Alert.alert("Carrinho vazio", "Adicione produtos antes de continuar.");
            router.replace("/lojas");
            return;
        }

        setEnviando(true);

        try {
            // 1. Criar pedido.
            const pedido = await criarPedido(cliente.id, lojaId);

            // 2. Registrar cada produto no pedido.
            for (const item of itens) {
                await adicionarProdutoPedido(
                    pedido.id,
                    item.produtoId,
                    item.quantidade,
                    item.preco
                );
            }

            // 3. Criar pagamento pendente.
            await criarPagamento(pedido.id, total, "pix");

            // Limpar somente depois de criar o pagamento.
            limpar();

            // 4. Abrir tela de pagamento.
            router.replace({
                pathname: "/pagamento/[pedidoId]",
                params: { pedidoId: String(pedido.id) },
            });
        } catch (error) {
            Alert.alert(
                "Não foi possível finalizar",
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao criar seu pedido."
            );
        } finally {
            setEnviando(false);
        }
    }

    if (!carregado) {
        return (
            <View style={styles.centralizado}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text style={styles.voltar}>‹ Voltar ao carrinho</Text>
            </Pressable>

            <Text style={styles.titulo}>Finalizar compra</Text>
            <Text style={styles.subtitulo}>
                Confira seu pedido antes de continuar.
            </Text>

            <View style={styles.card}>
                <Text style={styles.tituloCard}>Resumo dos produtos</Text>

                {itens.map((item) => (
                    <View key={item.produtoId} style={styles.linhaProduto}>
                        <View style={styles.infoProduto}>
                            <Text style={styles.nomeProduto}>{item.nome}</Text>
                            <Text style={styles.textoSecundario}>
                                Quantidade: {item.quantidade}
                            </Text>
                        </View>

                        <Text style={styles.valor}>
                            {moeda(item.preco * item.quantidade)}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.card}>
                <Text style={styles.tituloCard}>Forma de pagamento</Text>

                <View style={styles.pixSelecionado}>
                    <Text style={styles.pixTitulo}>⚡ Pix</Text>
                    <Text style={styles.pixDesconto}>10% de desconto</Text>
                </View>

                <Text style={styles.aviso}>
                    Este aplicativo utiliza pagamento simulado. Nenhuma transferência
                    bancária será realizada.
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.tituloCard}>Valores</Text>

                <View style={styles.linhaResumo}>
                    <Text style={styles.textoSecundario}>Subtotal</Text>
                    <Text style={styles.valor}>{moeda(subtotal)}</Text>
                </View>

                <View style={styles.linhaResumo}>
                    <Text style={styles.desconto}>Desconto Pix (10%)</Text>
                    <Text style={styles.desconto}>− {moeda(desconto)}</Text>
                </View>

                <View style={styles.divisor} />

                <View style={styles.linhaResumo}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValor}>{moeda(total)}</Text>
                </View>
            </View>

            <Pressable
                style={[
                    styles.botao,
                    (enviando || itens.length === 0) && styles.botaoDesabilitado,
                ]}
                disabled={enviando || itens.length === 0}
                onPress={finalizarCompra}
            >
                {enviando ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.botaoTexto}>Gerar pagamento simulado</Text>
                )}
            </Pressable>

            <Text style={styles.rodape}>
                Ao continuar, seu pedido será registrado no AllyStore.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 20,
        paddingTop: 55,
    },
    centralizado: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    voltar: {
        color: "#4F46E5",
        fontWeight: "600",
        marginBottom: 22,
    },
    titulo: {
        color: "#0F172A",
        fontSize: 28,
        fontWeight: "800",
    },
    subtitulo: {
        color: "#64748B",
        marginTop: 6,
        marginBottom: 22,
    },
    card: {
        backgroundColor: "#FFFFFF",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    tituloCard: {
        color: "#0F172A",
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 15,
    },
    linhaProduto: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 13,
        gap: 12,
    },
    infoProduto: {
        flex: 1,
    },
    nomeProduto: {
        color: "#0F172A",
        fontWeight: "600",
    },
    textoSecundario: {
        color: "#64748B",
        fontSize: 13,
        marginTop: 4,
    },
    valor: {
        color: "#0F172A",
        fontWeight: "700",
    },
    pixSelecionado: {
        borderWidth: 1,
        borderColor: "#4F46E5",
        backgroundColor: "#EEF2FF",
        padding: 15,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pixTitulo: {
        color: "#312E81",
        fontWeight: "800",
        fontSize: 16,
    },
    pixDesconto: {
        color: "#047857",
        fontWeight: "700",
        fontSize: 12,
    },
    aviso: {
        color: "#92400E",
        backgroundColor: "#FFFBEB",
        padding: 12,
        borderRadius: 10,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 12,
    },
    linhaResumo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    desconto: {
        color: "#059669",
        fontWeight: "600",
    },
    divisor: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 8,
    },
    totalLabel: {
        color: "#0F172A",
        fontWeight: "800",
        fontSize: 17,
    },
    totalValor: {
        color: "#0F172A",
        fontWeight: "900",
        fontSize: 21,
    },
    botao: {
        backgroundColor: "#4F46E5",
        padding: 17,
        borderRadius: 13,
        alignItems: "center",
        marginTop: 5,
    },
    botaoDesabilitado: {
        opacity: 0.5,
    },
    botaoTexto: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },
    rodape: {
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 11,
        marginTop: 15,
        marginBottom: 30,
    },
});
