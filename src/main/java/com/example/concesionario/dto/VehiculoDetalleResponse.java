package com.example.concesionario.dto;

import java.util.List;

public class VehiculoDetalleResponse {
	public Integer id;
	public String marca;
	public String modelo;
	public int anyo;
	public double precio;
	public String categoria;
	public String matricula;
	public String descripcion;
	
	public List<ImagenResponse> imagenes;
}
