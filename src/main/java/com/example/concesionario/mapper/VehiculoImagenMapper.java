package com.example.concesionario.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import com.example.concesionario.entity.VehiculoImagen;

public class VehiculoImagenMapper implements RowMapper<VehiculoImagen> {
	@Override
	public VehiculoImagen map(ResultSet rs) throws SQLException {
		return new VehiculoImagen(
			rs.getInt("id"),
			rs.getInt("vehiculo_id"), 
			rs.getString("url")
		);
	}
}
