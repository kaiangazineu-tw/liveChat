import { useNavigation } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import api from "../resources/api";
import Toast from "react-native-toast-message";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  async function handleRegister() {
    Toast.show({
      type: "info",
      text1: "Registrando usuário...",
    });

    try {
      await api.post("/users/register", { name, email, password });

      Toast.show({
        type: "success",
        text1: "Conta registrada com sucesso!",
        text2: "Faça login para continuar.",
      });

      navigation.goBack();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Tente novamente mais tarde.";

      Toast.show({
        type: "error",
        text1: "Erro ao registrar usuário!",
        text2: message,
      });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-gray-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          <View className="bg-gray-800 rounded-2xl p-6">
            <Text className="text-2xl font-bold text-white text-center mb-6">
              Crie sua conta
            </Text>

            {/* INICIO DO FORMULÁRIO */}

            <Text className="text-sm text-gray-300 mb-1">Nome</Text>
            <TextInput
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white mb-4"
              placeholder="Seu nome"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-sm text-gray-300 mb-1">Email</Text>
            <TextInput
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white mb-4"
              placeholder="email@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text className="text-sm text-gray-300 mb-1">Senha</Text>
            <TextInput
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white mb-6"
              placeholder="Sua senha"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={handleRegister}
              className="bg-blue-600 py-4 rounded-xl"
            >
              <Text className="text-white text-center font-bold">
                Cadastrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mt-4"
            >
              <Text className="text-center text-sm text-gray-400">
                Já possui uma conta?{" "}
                <Text className="text-blue-400 font-medium">Faça login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
