package com.example.liveChat.controllers;

import com.example.liveChat.dto.UserLoginDTO;
import com.example.liveChat.dto.UserLoginResponseDTO;
import com.example.liveChat.dto.UserRegisterDTO;
import com.example.liveChat.dto.UserResponseDTO;
import com.example.liveChat.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRegisterDTO body) {
        var newUser = userService.register(body);
        return ResponseEntity.ok(UserResponseDTO.forRegister(newUser));
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDTO> login(@RequestBody UserLoginDTO body){
        String token = userService.login(body);
        return ResponseEntity.ok(new UserLoginResponseDTO("User logged in successfully",token));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        var users = userService.findAll();
        var response = users.stream().map(UserResponseDTO::forRegister).toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

}
