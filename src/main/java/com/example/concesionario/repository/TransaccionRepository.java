package com.example.concesionario.repository;

import java.sql.Connection;

import com.example.concesionario.entity.Transaccion;
import com.example.concesionario.mapper.TransaccionMapper;
import com.example.concesionario.mapper.RowMapper;

public class TransaccionRepository extends BaseRepository<Transaccion> {

	public TransaccionRepository(Connection con) {
		super(con, new TransaccionMapper());
	}

	public TransaccionRepository(Connection con, RowMapper<Transaccion> mapper) {
		super(con, mapper);
	}

	@Override
	public String getTable() {
		return "transacciones";
	}

	@Override
	public String[] getColumnNames() {
		return new String[] { "id", "id_comercial", "id_cliente", "id_vehiculo", "tipo", "importe_final", "fecha", "metodo_pago", };
	}
	
	@Override
	public Integer getPrimaryKey(Transaccion t) {
		return t.getId();
	}
	
	@Override
	public void setPrimaryKey(Transaccion t, int id) {
		t.setId(id);
	}

	@Override
	public Object[] getInsertValues(Transaccion t) {
		return new Object[] { t.getFecha(),t.getTipo(), t.getMetodoPago(), t.getImporteFinal(), t.getId_cliente(), t.getId_comercial(), t.getId_vehiculo() };
	}

	@Override
	public Object[] getUpdateValues(Transaccion t) {
		return new Object[] { t.getFecha(), t.getTipo(), t.getMetodoPago(), t.getImporteFinal(), t.getId_cliente(), t.getId_comercial(), t.getId_vehiculo(), t.getId() };
	}
}
