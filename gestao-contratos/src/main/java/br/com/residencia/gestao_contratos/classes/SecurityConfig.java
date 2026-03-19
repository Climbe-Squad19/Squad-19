package br.com.residencia.gestao_contratos.classes;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity; //remove isso tbm pos testes
import org.springframework.security.web.SecurityFilterChain; // isso tbm
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() 
            )
            .formLogin(form -> form.disable()) 
            .httpBasic(basic -> basic.disable());
            
        return http.build();
    }
}

// essa classe é voltada para a criptografia da senha, utilizando o BCrypt, para testes manter assim
//depois remover o securityFilterChain