package com.example.concesionario.entity;

public class Comercial extends Empleado {
	private String comision;

	public Comercial(Integer id, String nombre, String apellido, String puesto, double sueldo, String comision) {
		super(id, nombre, apellido, puesto, sueldo);
		this.comision = comision;
	}
	
	public String getComision() {
		return comision;
	}

	public void setComision(String comision) {
		this.comision = comision;
	}

	@Override
	public String toString() {
		return "Comercial [id=" + getId() + ", comision=" + comision + "]";
	}

}