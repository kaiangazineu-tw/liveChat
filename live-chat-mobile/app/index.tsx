import Toast from "react-native-toast-message";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import api from "../resources/api";
import { saveToken } from "../service/token";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;

    setLoading(true);

    Toast.show({
      type: "info",
      text1: "Fazendo login...",
    });

    try {
      const response = await api.post("/users/login", { email, password });

      const { token } = response.data;

      await saveToken(token);

      Toast.show({
        type: "success",
        text1: "Login bem-sucedido!",
        text2: "Redirecionando para o chat...",
      });

      router.replace("/home");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Tente novamente mais tarde.";

      Toast.show({
        type: "error",
        text1: "Erro ao fazer login!",
        text2: message,
      });

      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        <View className="w-full bg-gray-800 p-6 rounded-xl shadow-sm">
          <Text className="mb-6 text-2xl font-bold text-center text-white">
            Entrar no Chat
          </Text>

          {/* INPUT DE EMAIL */}
          <View className="mb-4">
            <Text className="block mb-2 text-sm text-gray-300">Email</Text>
            <TextInput
              className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500"
              placeholder="seu@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* INPUT DE SENHA */}
          <View className="mb-6">
            <Text className="block mb-2 text-sm text-gray-300">Senha</Text>
            <TextInput
              className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500"
              placeholder="******"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* BOTÃO DE ENTRAR */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`w-full p-4 rounded-lg flex-row justify-center items-center ${
              loading
                ? "bg-green-800 opacity-70"
                : "bg-green-600 active:bg-green-500"
            }`}
          >
            <Text
              className={`font-bold text-lg ${loading ? "text-gray-300" : "text-white"}`}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          {/* LINK PARA CADASTRO */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-gray-400">Não tem conta? </Text>
            {/* Ajuste o href conforme sua rota de registro */}
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-blue-400 font-bold ml-1">
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
