package com.example.concesionario.entity;

public class Vehiculo {
	private Integer id;
	private String marca;
	private String modelo;
	private int anyo;
	private double precio;
	private String categoria; // SUV, Sport, // GAMMAs
	private String matricula;
	private String descripcion;

	public Vehiculo(Integer id, String marca, String modelo, int anyo, double precio, String categoria,
			String matricula, String descripcion) {
		super();
		this.id = id;
		this.marca = marca;
		this.modelo = modelo;
		this.anyo = anyo;
		this.precio = precio;
		this.categoria = categoria;
		this.matricula = matricula;
		this.descripcion = descripcion;
	}

	public Integer getId() {
		return id;
	}

	public String getMarca() {
		return marca;
	}

	public String getModelo() {
		return modelo;
	}

	public int getAnyo() {
		return anyo;
	}

	public double getPrecio() {
		return precio;
	}

	public String getCategoria() {
		return categoria;
	}

	public String getMatricula() {
		return matricula;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public void setMarca(String marca) {
		this.marca = marca;
	}

	public void setModelo(String modelo) {
		this.modelo = modelo;
	}

	public void setAnyo(int anyo) {
		this.anyo = anyo;
	}

	public void setPrecio(double precio) {
		this.precio = precio;
	}

	public void setCategoria(String categoria) {
		this.categoria = categoria;
	}

	public void setMatricula(String matricula) {
		this.matricula = matricula;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}


	@Override
	public String toString() {
		return "Vehiculo [ ID = " + id + ", marca = " + marca + ", modelo = " + modelo + ", anyo = " + anyo
				+ ", precio = " + precio + ", categoria = " + categoria + ", matricula = " + matricula + ", descripcion = " + descripcion + " ]";

	}

}
