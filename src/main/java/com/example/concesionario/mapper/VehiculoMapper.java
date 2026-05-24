package com.example.concesionario.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import com.example.concesionario.entity.Vehiculo;

public class VehiculoMapper implements RowMapper<Vehiculo> {
	@Override
    public Vehiculo map(ResultSet rs) throws SQLException {
        return new Vehiculo(
                rs.getInt("id"),
                rs.getString("marca"),
                rs.getString("modelo"),
                rs.getInt("anyo"),
                rs.getDouble("precio"),
                rs.getString("categoria"),
                rs.getString("matricula"),
                rs.getString("descripcion")
        );
    }
}
