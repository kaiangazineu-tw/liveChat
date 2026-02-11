import { Stack } from "expo-router";
import "text-encoding";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: "#111827" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Login" }}
      />

      <Stack.Screen
        name="register"
        options={{
          title: "Criar Conta",
          headerShown: true,
          headerBackTitle: "Voltar",
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
