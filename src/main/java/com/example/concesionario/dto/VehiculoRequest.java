package com.example.concesionario.dto;

public record VehiculoRequest(

	String marca, 
	String modelo, 
	int anyo, 
	double precio, 
	String categoria, 
	String matricula, 
	String descripcion
	) 
{
}
