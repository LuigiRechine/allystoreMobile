
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function LogoutScreen() {
  const router = useRouter();
  const { sair, perfil } = useAuth();
  const [carregando, setCarregando] = useState(false);

  async function fazerLogout() {
    try {
      setCarregando(true);

      await sair();

      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível sair da conta. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconeContainer}>
          <Text style={styles.icone}>↪</Text>
        </View>

        <Text style={styles.titulo}>Sair da conta?</Text>

        <Text style={styles.descricao}>
          Você está conectado como{" "}
          <Text style={styles.nome}>
            {perfil?.usuario?.nome ?? "Usuário"}
          </Text>
          . Deseja realmente sair do AllyStore?
        </Text>

        <Pressable
          style={[
            styles.botaoSair,
            carregando && styles.desabilitado,
          ]}
          onPress={fazerLogout}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotaoSair}>
              Sair da conta
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.botaoVoltar}
          onPress={() => router.back()}
          disabled={carregando}
        >
          <Text style={styles.textoBotaoVoltar}>
            Cancelar
          </Text>
        </Pressable>
      </View>

      <Text style={styles.rodape}>AllyStore © 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconeContainer: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  icone: {
    fontSize: 38,
    color: "#DC2626",
    fontWeight: "700",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  descricao: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 28,
  },
  nome: {
    color: "#0F172A",
    fontWeight: "800",
  },
  botaoSair: {
    width: "100%",
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
  },
  textoBotaoSair: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  botaoVoltar: {
    padding: 15,
    marginTop: 5,
  },
  textoBotaoVoltar: {
    color: "#64748B",
    fontWeight: "700",
  },
  desabilitado: {
    opacity: 0.6,
  },
  rodape: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 25,
  },
});
