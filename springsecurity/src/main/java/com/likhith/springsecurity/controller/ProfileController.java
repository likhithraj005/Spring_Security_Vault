package com.likhith.springsecurity.controller;

import com.likhith.springsecurity.io.ProfileRequest;
import com.likhith.springsecurity.io.ProfileResponse;
import com.likhith.springsecurity.service.EmailService;
import com.likhith.springsecurity.service.ProfileService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

@RestController
//@RequestMapping("/api/v1.0")
@RequiredArgsConstructor
@SecurityRequirement(name = "JWT")
@Tag(name = "Profile", description = "User profile endpoints")
public class ProfileController {

    private final ProfileService profileService;
    private final EmailService emailService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest request){
        ProfileResponse response = profileService.createProfile(request);

        //send Welcome Email
        emailService.sendWelcomeEmail(response.getEmail(), response.getName());

        return response;
    }

    @GetMapping("/test")
    public String test(){
        return "Auth is working";
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile(@CurrentSecurityContext(expression = "authentication?.name") String email){
        return profileService.getProfile(email);
    }



}
