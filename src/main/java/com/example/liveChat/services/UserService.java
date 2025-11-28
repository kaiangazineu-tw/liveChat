package com.example.liveChat.services;

import com.example.liveChat.dto.UserRegisterDTO;
import com.example.liveChat.exceptions.UserAlreadyExistsException;
import com.example.liveChat.models.User;
import com.example.liveChat.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;


    public User register(UserRegisterDTO body){
        boolean exists = userRepository.findByEmail(body.email()).isPresent();
        if(exists) {
            throw new UserAlreadyExistsException("A user with email " + body.email() + "already exists");
        }

        User newUser = new User(body.name(), body.email(), body.password());
        return userRepository.save(newUser);
    }
}
