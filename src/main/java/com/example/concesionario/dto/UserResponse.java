package com.example.concesionario.dto;

public record UserResponse(
	Integer id,
	String nombre,
	String email,
	String role
) {}
