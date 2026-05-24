package com.example.concesionario.dto;

public record VehiculoResumen(
	String marca,
	String modelo,
	int anyo,
	String precio,
	String categoria
) {}
