package com.likhith.springsecurity.service;

import com.likhith.springsecurity.entity.UserEntity;
import com.likhith.springsecurity.io.ProfileRequest;
import com.likhith.springsecurity.io.ProfileResponse;
import com.likhith.springsecurity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private UserEntity convertToUserEntity(ProfileRequest request) {
        return UserEntity.builder()
                .email(request.getEmail())
                .userId(UUID.randomUUID().toString())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .isAccountVerified(false)
                .resetOtpExpireAt(0L)
                .verifyOtp(null)
                .verifyOtpExpireAt(0L)
                .resetOtp(null)
                .build();

    }

    private ProfileResponse convertToProfileResponse(UserEntity newProfile) {
        return ProfileResponse.builder()
                .name(newProfile.getName())
                .email(newProfile.getEmail())
                .userId(newProfile.getUserId())
                .isAccountVerified(newProfile.getIsAccountVerified())
                .build();
    }

    @Override
    public ProfileResponse createProfile(ProfileRequest request) {
        UserEntity newProfile = convertToUserEntity(request);
//        newProfile = userRepository.save(newProfile);
//        return convertToProfileResponse(newProfile);

        if(!userRepository.existsByEmail(request.getEmail())){
            newProfile = userRepository.save(newProfile);
            return convertToProfileResponse(newProfile);
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,"Email already in use");

    }

    @Override
    public ProfileResponse getProfile(String email) {
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

        return convertToProfileResponse(existingUser);
    }

    @Override
    public void sendResetOtp(String email) {
        UserEntity existingEntity =  userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        //Generating 6 digits otp
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));

        //calculate expiry time (current time + 15min in milliseconds)
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 100);

        //update profile Entity
        existingEntity.setResetOtp(otp);
        existingEntity.setResetOtpExpireAt(expiryTime);

        //save into the database
        userRepository.save(existingEntity);

        try{
            //send the reset otp email
            emailService.sendResetOtpEmail(existingEntity.getEmail(), otp);
        }catch (Exception ex){
            throw new RuntimeException(ex.getMessage());
        }

    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        UserEntity existingUser = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // Check if OTP is correct
        if(existingUser.getResetOtp() == null || !existingUser.getResetOtp().equals(otp)){
            throw new IllegalArgumentException("Invalid OTP");
        }

        // Check if OTP is expired
        if (existingUser.getResetOtpExpireAt() < System.currentTimeMillis()) {
            throw new IllegalArgumentException("OTP has expired");
        }

        // Update password
        existingUser.setPassword(passwordEncoder.encode(newPassword));

        // Clear OTP fields
        existingUser.setResetOtp(null);
        existingUser.setResetOtpExpireAt(0L);

        userRepository.save(existingUser);
    }

    @Override
    public void sendOtp(String email) {
        UserEntity existingUser = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

        // If already verified, skip sending OTP
        if(existingUser.getIsAccountVerified() != null && existingUser.getIsAccountVerified()){
            return;
        }

        //Generate 6 Digit OTP
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));

        //calculate expiry time (current time + 24hr in milliseconds)
        long expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 100);

        // 2. Set OTP and expiry time
        existingUser.setVerifyOtp(otp);
        existingUser.setVerifyOtpExpireAt(expiryTime);

        // 3. Save the updated user
        userRepository.save(existingUser);

        try {
            emailService.sendOtpEmail(existingUser.getEmail(), existingUser.getVerifyOtp());
        }catch (Exception ex){
            throw new RuntimeException(ex.getMessage());
        }
    }

    @Override
    public void verifyOtp(String email, String otp) {
        UserEntity existingUser = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found " + email));

        if(existingUser.getVerifyOtp() == null || !existingUser.getVerifyOtp().equals(otp)){
            throw new IllegalArgumentException("Invalid OTP");
        }

        // Check if OTP is expired
        if (existingUser.getVerifyOtpExpireAt() < System.currentTimeMillis()) {
            throw new IllegalArgumentException("OTP has expired");
        }

        existingUser.setIsAccountVerified(true);
        existingUser.setVerifyOtp(null);
        existingUser.setVerifyOtpExpireAt(0L);

        userRepository.save(existingUser);
    }
}
