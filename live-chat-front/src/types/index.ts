export interface User {
    id: string;
    name: string;
    email: string;
}

export interface FriendRequest {
    id: number; // ID da Amizade
    requesterName: string;
    requesterId: string;
}