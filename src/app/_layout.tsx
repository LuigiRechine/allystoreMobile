
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { CarrinhoProvider } from "../contexts/CarrinhoContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#F7F7F7",
            },
          }}
        />
      </CarrinhoProvider>
    </AuthProvider>
  );
}
