package com.example.liveChat.controllers;

import com.example.liveChat.dto.UserRegisterDTO;
import com.example.liveChat.dto.UserResponseDTO;
import com.example.liveChat.models.User;
import com.example.liveChat.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRegisterDTO body) {
        User newUser = userService.register(body);
        return ResponseEntity.ok(UserResponseDTO.forRegister(newUser));
    }

//    @GetMapping("/users")
//    public ResponseEntity getAllUsers() {
//        List<UserResponseDTO> usersList = this.userService
//                .findAll().stream()
//                .map(UserResponseDTO::new).toList();
//        return ResponseEntity.ok(usersList);
//    }
//
//    @DeleteMapping("/users/{id}")
//    public ResponseEntity deleteUser(@PathVariable(value="id") String id){
//        Optional<User> user = userService.findById(id);
//        if(user.isEmpty()){
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
//        }
//        userService.delete(user.get());
//        return ResponseEntity.status(HttpStatus.OK).body("User deleted successfully");
//    }

}
