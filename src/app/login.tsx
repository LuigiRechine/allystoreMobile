
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useRouter } from "expo-router";

import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {

  const router = useRouter();

  const { entrar, sair, perfil, carregando } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    try {
      setErro("");

      if (!email.trim() || !senha) {
        setErro("Preencha o e-mail e a senha.");
        return;
      }

      setLoading(true);

      await entrar(email.trim(), senha);

      router.replace("/lojas");

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login."
      );
    } finally {
      setLoading(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.logo}>AllyStore</Text>

      <Text style={styles.subtitle}>
        Entre para continuar comprando.
      </Text>

      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>

        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {erro ? (
          <Text style={styles.error}>{erro}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        AllyStore © 2026
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F7F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2563EB",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    marginBottom: 35,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#222",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    color: "#222",
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#DC2626",
    marginBottom: 12,
    fontSize: 13,
  },
  success: {
    fontSize: 22,
    color: "#16A34A",
    fontWeight: "bold",
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  description: {
    color: "#666",
    marginVertical: 12,
  },
  info: {
    color: "#444",
    marginTop: 8,
  },
  footer: {
    textAlign: "center",
    color: "#999",
    marginTop: 30,
  },
});
