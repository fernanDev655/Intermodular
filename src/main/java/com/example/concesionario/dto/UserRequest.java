package com.example.concesionario.dto;

public record UserRequest(

String nombre,
String apellidos,
String dni,
String telefono,
String email,
String password,
String role
) 
{}
