package com.example.concesionario.entity;

import java.time.LocalDateTime;

public class Transaccion {
	private int id;
	private LocalDateTime fecha;
	private String tipo;
	private String metodoPago;
	private double importeFinal;
	private int id_cliente;
	private int id_comercial;
	private int id_vehiculo;

	public Transaccion(int id, LocalDateTime fecha, String tipo, String metodoPago, double importeFinal, int id_cliente,
			int id_comercial, int id_vehiculo) {
		super();
		this.id = id;
		this.fecha = fecha;
		this.tipo = tipo;
		this.metodoPago = metodoPago;
		this.importeFinal = importeFinal;
		this.id_cliente = id_cliente;
		this.id_comercial = id_comercial;
		this.id_vehiculo = id_vehiculo;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public LocalDateTime getFecha() {
		return fecha;
	}

	public void setFecha(LocalDateTime fecha) {
		this.fecha = fecha;
	}

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public String getMetodoPago() {
		return metodoPago;
	}

	public void setMetodoPago(String metodoPago) {
		this.metodoPago = metodoPago;
	}

	public double getImporteFinal() {
		return importeFinal;
	}

	public void setImporteFinal(double importefinal) {
		this.importeFinal = importefinal;
	}

	public int getId_cliente() {
		return id_cliente;
	}

	public void setId_cliente(int id_cliente) {
		this.id_cliente = id_cliente;
	}

	public int getId_comercial() {
		return id_comercial;
	}

	public void setId_comercial(int id_comercial) {
		this.id_comercial = id_comercial;
	}

	public int getId_vehiculo() {
		return id_vehiculo;
	}

	public void setId_vehiculo(int id_vehiculo) {
		this.id_vehiculo = id_vehiculo;
	}

	@Override
	public String toString() {
		return "Transaccion [id=" + id + ", fecha=" + fecha + ", tipo=" + tipo + ", metodoPago=" + metodoPago
				+ ", importefinal=" + importeFinal + ", id_cliente=" + id_cliente + ", id_comercial=" + id_comercial
				+ ", id_vehiculo=" + id_vehiculo + "]";
	}

}