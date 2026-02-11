import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import {
  Search,
  LogOut,
  UserPlus,
  Check,
  X,
  User as UserIcon,
} from "lucide-react-native";

import api from "../resources/api";
import { deleteToken } from "../service/token";

interface User {
  id: string;
  name: string;
  email: string;
}

interface FriendRequest {
  id: number;
  requesterName: string;
}

export default function Home() {
  const router = useRouter();

  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [emailSearch, setEmailSearch] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [loadingSearch, setLoadingSearch] = useState(false);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await api.get("/friendships");
      setFriends(res.data);
    } catch (error) {
      console.log("Erro friends", error);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get("/friendships/requests");
      setRequests(res.data);
    } catch (error) {
      console.log("Erro requests", error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchFriends(), fetchRequests()]);
  }, [fetchFriends, fetchRequests]);

  useEffect(() => {
    refreshData();
  }, []);

  async function handleLogout() {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await deleteToken();
          router.replace("/");
        },
      },
    ]);
  }

  async function handleSearch() {
    if (!emailSearch.trim()) return;
    setLoadingSearch(true);

    try {
      setFoundUser(null);
      const res = await api.get("/users/search", {
        params: { email: emailSearch.trim() },
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        setFoundUser(res.data[0]);
      } else {
        Toast.show({ type: "error", text1: "Usuário não encontrado." });
      }
    } catch (error: any) {
      console.log("Erro completo:", error);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Dados do erro:", error.response.data);
      } else if (error.request) {
        console.log("O erro foi na requisição (sem resposta do servidor)");
      } else {
        console.log("Erro na configuração:", error.message);
      }
      Toast.show({ type: "error", text1: "Erro ao buscar usuário." });
    } finally {
      setLoadingSearch(false);
    }
  }

  async function sendRequest() {
    if (!foundUser) return;
    try {
      await api.post("/friendships/send", { targetUserId: foundUser.id });
      Toast.show({
        type: "success",
        text1: `Pedido enviado para ${foundUser.name}!`,
      });
      setFoundUser(null);
      setEmailSearch("");
      refreshData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao enviar.";
      Toast.show({ type: "error", text1: msg });
    }
  }

  async function handleAccept(id: number) {
    try {
      await api.patch(`/friendships/${id}/accept`);
      Toast.show({ type: "success", text1: "Agora vocês são amigos!" });
      refreshData();
    } catch (error) {
      Toast.show({ type: "error", text1: "Erro ao aceitar." });
    }
  }

  async function handleReject(id: number) {
    try {
      await api.patch(`/friendships/${id}/reject`);
      Toast.show({ type: "info", text1: "Solicitação recusada." });
      refreshData();
    } catch (error) {
      Toast.show({ type: "error", text1: "Erro ao rejeitar." });
    }
  }

  function openChat(user: User) {
    router.push({
      pathname: "/chat/[id]",
      params: { id: user.id, name: user.name },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 pt-8">
      <StatusBar barStyle="light-content" />

      <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-800">
        <Text className="text-white text-xl font-bold">LiveChat</Text>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View className="px-6 py-4">
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700"
            placeholder="Buscar por email..."
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            value={emailSearch}
            onChangeText={setEmailSearch}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-blue-600 w-12 items-center justify-center rounded-lg"
          >
            <Search size={20} color="white" />
          </TouchableOpacity>
        </View>

        {foundUser && (
          <View className="mt-4 bg-gray-800 p-4 rounded-lg border border-blue-500 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">{foundUser.name}</Text>
              <Text className="text-gray-400 text-xs">{foundUser.email}</Text>
            </View>
            <TouchableOpacity
              onPress={sendRequest}
              className="bg-green-600 px-3 py-2 rounded-md flex-row items-center gap-1"
            >
              <UserPlus size={16} color="white" />
              <Text className="text-white text-xs font-bold">Adicionar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="flex-row border-b border-gray-800 px-6">
        <TouchableOpacity
          onPress={() => setActiveTab("friends")}
          className={`flex-1 pb-3 items-center ${activeTab === "friends" ? "border-b-2 border-blue-500" : ""}`}
        >
          <Text
            className={`${activeTab === "friends" ? "text-blue-400 font-bold" : "text-gray-400"}`}
          >
            Amigos ({friends.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("requests")}
          className={`flex-1 pb-3 items-center ${activeTab === "requests" ? "border-b-2 border-blue-500" : ""}`}
        >
          <Text
            className={`${activeTab === "requests" ? "text-blue-400 font-bold" : "text-gray-400"}`}
          >
            Pedidos ({requests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-4">
        {activeTab === "friends" ? (
          <FlatList
            data={friends}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={() => (
              <Text className="text-gray-500 text-center mt-10">
                Nenhum amigo ainda.
              </Text>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => openChat(item)}
                className="bg-gray-800 mb-3 p-4 rounded-xl flex-row items-center gap-4 active:bg-gray-700"
              >
                <View className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center">
                  <Text className="text-blue-200 font-bold text-lg">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">
                    {item.name}
                  </Text>
                  <Text className="text-green-400 text-xs">
                    Toque para conversar
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={() => (
              <Text className="text-gray-500 text-center mt-10">
                Nenhuma solicitação.
              </Text>
            )}
            renderItem={({ item }) => (
              <View className="bg-gray-800 mb-3 p-4 rounded-xl border border-gray-700">
                <Text className="text-white mb-3">
                  <Text className="font-bold">{item.requesterName}</Text> quer
                  ser seu amigo.
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleAccept(item.id)}
                    className="flex-1 bg-green-600 py-2 rounded-lg items-center flex-row justify-center gap-2"
                  >
                    <Check size={16} color="white" />
                    <Text className="text-white font-bold">Aceitar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleReject(item.id)}
                    className="flex-1 bg-red-600 py-2 rounded-lg items-center flex-row justify-center gap-2"
                  >
                    <X size={16} color="white" />
                    <Text className="text-white font-bold">Recusar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
