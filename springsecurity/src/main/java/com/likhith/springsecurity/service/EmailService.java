package com.likhith.springsecurity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.properties.mail.smtp.from}")
    private String fromEmail;

    public void sendWelcomeEmail(String toEmail, String name){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to our Spring Security Vault");
        message.setText("Hello " + name + ",\n\nWelcome to our app! We're excited to have you on board.\n\n- The Team");
        javaMailSender.send(message);
    }

    public void sendResetOtpEmail(String toEmail, String otp){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);

        message.setSubject("Your Password Reset OTP");
        message.setText("Hello,\n\nHere is your OTP to reset your password: " + otp + "\n\nThis OTP is valid for the next 15 minutes.\n\n- The Team");

        javaMailSender.send(message);
    }

    public void sendOtpEmail(String toEmail, String otp){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);

        message.setSubject("Your OTP Verification Code");
        message.setText("Hello,\n\nYour OTP code is: " + otp + "\n\nThis code will expire in 24 hours.\n\n- The Team");

        javaMailSender.send(message);

    }
}
