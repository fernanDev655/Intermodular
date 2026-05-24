package com.example.concesionario.entity;

public class User {
	private Integer id;
	private String nombre;
	private String apellidos;
	private String dni;
	private String telefono;
	private String email;
	private String password;
	private String role;

	public User(Integer id, String nombre, String apellidos, String dni, String telefono, String email,
			String password, String role) {
		super();
		this.id = id;
		this.nombre = nombre;
		this.apellidos = apellidos;
		this.dni = dni;
		this.telefono = telefono;
		this.email = email;
		this.password = password;
		this.role = role;
	}

	public Integer getId() {
		return id;
	}

	// FIX: tipo corregido de User a Integer
	public void setId(Integer id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getApellidos() {
		return apellidos;
	}

	public void setApellidos(String apellidos) {
		this.apellidos = apellidos;
	}

	public String getDni() {
		return dni;
	}

	public void setDni(String dni) {
		this.dni = dni;
	}

	public String getTelefono() {
		return telefono;
	}

	public void setTelefono(String telefono) {
		this.telefono = telefono;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	@Override
	public String toString() {
		return "User [ID = " + id + ", nombre = " + nombre + ", apellidos = " + apellidos
				+ ", dni = " + dni + ", telefono = " + telefono
				+ ", email = " + email + ", role = " + role + "]";
	}
}
