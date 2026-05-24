package com.example.concesionario.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import com.example.concesionario.entity.Empleado;

public class EmpleadoMapper implements RowMapper<Empleado> {
	@Override
    public Empleado map(ResultSet rs) throws SQLException {
        return new Empleado(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("apellidos"),
                rs.getString("puesto"),
                rs.getInt("sueldo")
        		);
    }
}
