package com.likhith.springsecurity.oauth;

import com.likhith.springsecurity.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

//@Component
//@RequiredArgsConstructor
//public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
//
//    private final JwtUtil jwtUtil;
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
//            throws IOException, ServletException {
//
//        Object principal = authentication.getPrincipal();
//        String email;
//
//        if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User oAuth2User) {
//            email = oAuth2User.getAttribute("email");
//
//            // Fallback if email is null (GitHub may omit it)
//            if (email == null) {
//                email = oAuth2User.getAttribute("login") + "@github.com";
//            }
//
//        } else if (principal instanceof UserDetails userDetails) {
//            email = userDetails.getUsername();
//        } else {
//            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unable to extract email");
//            return;
//        }
//
//        UserDetails userDetails = new org.springframework.security.core.userdetails.User(email, "", List.of());
//        String jwtToken = jwtUtil.generateToken(userDetails);
//
//        Cookie cookie = new Cookie("jwt", jwtToken);
//        cookie.setHttpOnly(true);
//        cookie.setPath("/");
//        cookie.setMaxAge(24 * 60 * 60);
//        cookie.setSecure(true); // set to true in production (HTTPS)
//        response.addCookie(cookie);
//
//        response.sendRedirect("https://springsecurityvault.netlify.app");
//    }
//}

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        Object principal = authentication.getPrincipal();
        String email;

        if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User oAuth2User) {
            email = oAuth2User.getAttribute("email");
            if (email == null) {
                email = oAuth2User.getAttribute("login") + "@github.com";
            }

        } else if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unable to extract email");
            return;
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(email, "", List.of());
        String jwtToken = jwtUtil.generateToken(userDetails);

        // Set secure JWT cookie with SameSite=None
        ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")  // Required for cross-site (Netlify <-> Render)
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();

        response.setHeader("Set-Cookie", cookie.toString());

        // ✅ Redirect back to frontend
        response.sendRedirect("https://springsecurityvault.netlify.app");
    }
}


