package com.example.concesionario.dto.auth;

public record RegisterRequest(
	String nombre,
	//String apellidos,
	//String dni,
	//String telefono,
	String email, 
	String password
	//String role
) {}
