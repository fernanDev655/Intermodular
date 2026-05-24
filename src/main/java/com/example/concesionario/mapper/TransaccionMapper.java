package com.example.concesionario.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

import com.example.concesionario.entity.Transaccion;

public class TransaccionMapper implements RowMapper<Transaccion> {
	@Override
    public Transaccion map(ResultSet rs) throws SQLException {
        return new Transaccion(
                rs.getInt("id"),
                rs.getObject("fecha", LocalDateTime.class),
				rs.getString("tipo"),
				rs.getString("metodo_pago"),
				rs.getDouble("importe_final"),
				rs.getInt("id_cliente"),
				rs.getInt("id_comercial"),
				rs.getInt("id_vehiculo")
		);
    }
}
