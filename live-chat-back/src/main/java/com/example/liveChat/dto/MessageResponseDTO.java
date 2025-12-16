package com.example.liveChat.dto;

import java.time.LocalDateTime;

public record MessageResponseDTO(
        Long id,
        String content,
        String senderId,
        String senderName,
        LocalDateTime timestamp
) {
}
