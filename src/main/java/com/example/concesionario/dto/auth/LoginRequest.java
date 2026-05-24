package com.example.concesionario.dto.auth;

public record LoginRequest(
	String email,
	String password
) {}
