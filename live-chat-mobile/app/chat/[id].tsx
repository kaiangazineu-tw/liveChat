import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Client } from "@stomp/stompjs";
import Toast from "react-native-toast-message";
import { Send } from "lucide-react-native";

import api from "../../resources/api";
import { getToken } from "../../service/token";

const BROKER_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderName?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams();
  const friendId = String(id);
  const friendName = String(name);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const stompClientRef = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    async function loadInitialData() {
      try {
        const userRes = await api.get("/users/me");
        const myUser = userRes.data;
        setCurrentUser(myUser);

        const msgRes = await api.get(`/messages/${friendId}`);
        setMessages(msgRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar chat", error);
        Toast.show({ type: "error", text1: "Erro ao carregar conversas" });
        setLoading(false);
      }
    }

    loadInitialData();
  }, [friendId]);

  useEffect(() => {
    if (!currentUser) return;

    let client: Client;

    const connectStomp = async () => {
      const token = await getToken();
      if (!token) return;

      client = new Client({
        brokerURL: BROKER_URL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,

        onConnect: () => {
          client.subscribe(`/user/queue/messages`, (message) => {
            const receivedMsg: Message = JSON.parse(message.body);

            setMessages((prev) => {
              if (prev.some((m) => m.id === receivedMsg.id)) return prev;
              const isRelevant =
                (receivedMsg.senderId === currentUser.id &&
                  receivedMsg.receiverId === friendId) ||
                (receivedMsg.senderId === friendId &&
                  receivedMsg.receiverId === currentUser.id);

              if (isRelevant) {
                return [...prev, receivedMsg];
              }
              return prev;
            });
          });
        },
        onStompError: (frame) => {
          console.error("Erro Broker:", frame.headers["message"]);
        },
        onWebSocketError: (event) => {
          console.error("Erro WebSocket", event);
        },
      });

      client.activate();
      stompClientRef.current = client;
    };

    connectStomp();

    return () => {
      if (client) client.deactivate();
    };
  }, [currentUser, friendId]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages]);

  const handleSendMessage = () => {
    if (
      !newMessage.trim() ||
      !stompClientRef.current?.connected ||
      !currentUser
    )
      return;

    const chatMessage = {
      receiverId: friendId,
      content: newMessage,
    };

    try {
      stompClientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMessage),
      });
      setNewMessage("");
    } catch (error) {
      Toast.show({ type: "error", text1: "Erro ao enviar" });
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#1f2937",
          },
          headerTintColor: "#fff",
          headerShadowVisible: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: () => (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-xs">
                  {friendName?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-white font-bold text-lg">{friendName}</Text>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 20,
            gap: 12,
          }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe = String(item.senderId) === String(currentUser?.id);

            return (
              <View
                className={`flex-row ${isMe ? "justify-end" : "justify-start"}`}
              >
                <View
                  className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                    isMe
                      ? "bg-blue-600 rounded-tr-none"
                      : "bg-gray-800 rounded-tl-none border border-gray-700"
                  }`}
                >
                  <Text className="text-white text-base leading-5">
                    {item.content}
                  </Text>
                  <Text
                    className={`text-[10px] text-right mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}
                  >
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 opacity-50">
              <Text className="text-4xl">👋</Text>
              <Text className="text-gray-500 text-center mt-4">
                Inicie a conversa com {friendName}
              </Text>
            </View>
          }
        />

        <View
          className="bg-gray-800 border-t border-gray-700"
          style={{
            paddingBottom: Platform.OS === "ios" ? Math.max(insets.bottom) : 4,
          }}
        >
          <View className="px-4 py-2 flex-row items-center gap-3">
            <TextInput
              className="flex-1 bg-gray-900 text-white rounded-2xl px-4 py-3 border border-gray-700 max-h-32"
              placeholder="Mensagem..."
              placeholderTextColor="#6B7280"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              textAlignVertical="center"
              autoCorrect={true}
              spellCheck={true}
              keyboardType="default"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center transition-all ${
                newMessage.trim() ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <Send size={18} color={newMessage.trim() ? "white" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
