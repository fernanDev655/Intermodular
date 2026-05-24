package com.example.concesionario.dto;

public record VehiculoResumenResponse(
		int id, 
		String marca, 
		String modelo, 
		int anyo,
		double precio,
		String categoria,
		String matricula,
		String descripcion,
		String imagen
	) {}
