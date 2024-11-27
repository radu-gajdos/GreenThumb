package com.example.backend;

import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import static io.jsonwebtoken.security.Keys.secretKeyFor;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		System.out.println(secretKeyFor(SignatureAlgorithm.HS256).toString());
		SpringApplication.run(BackendApplication.class, args);
	}

}
