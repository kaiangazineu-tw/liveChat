// services/token.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token;
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
