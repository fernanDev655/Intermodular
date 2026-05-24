package com.example.concesionario.entity;

public class VehiculoImagen {

    private Integer id;
    private Integer vehiculoId;
    private String url;
    
	public VehiculoImagen(Integer id, Integer vehiculoId, String url) {
		super();
		this.id = id;
		this.vehiculoId = vehiculoId;
		this.url = url;
	}
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public Integer getVehiculoId() {
		return vehiculoId;
	}
	public void setVehiculoId(Integer vehiculoId) {
		this.vehiculoId = vehiculoId;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}

	@Override
	public String toString() {
		return "DirectorImagen [id=" + id + ", vehiculoId=" + vehiculoId + ", url=" + url + "]";
	}
}