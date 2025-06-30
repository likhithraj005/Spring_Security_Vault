package com.likhith.springsecurity.oauth;

import com.likhith.springsecurity.entity.UserEntity;
import com.likhith.springsecurity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        // Fallback if email is null (GitHub sometimes does this)
        if (email == null) {
            String login = (String) attributes.get("login");
            email = login + "@github.com";
        }

        // Save user if not already present
        Optional<UserEntity> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            UserEntity newUser = UserEntity.builder()
                    .userId(UUID.randomUUID().toString())
                    .email(email)
                    .name(name != null ? name : "GitHub User")
                    .password("") // OAuth users won't log in with password
                    .isAccountVerified(true)
                    .build();
            userRepository.save(newUser);
        }

        // Return an OAuth2User with required authorities and attributes
        return new DefaultOAuth2User(
                Collections.emptyList(),
                attributes,
                "email" // or "login" depending on what you need to access
        );
    }
}
