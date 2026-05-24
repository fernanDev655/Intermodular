package com.example.concesionario.repository;

import java.sql.Connection;

import com.example.concesionario.entity.Empleado;
import com.example.concesionario.mapper.EmpleadoMapper;
import com.example.concesionario.mapper.RowMapper;

public class EmpleadoRepository extends BaseRepository<Empleado> {

	public EmpleadoRepository(Connection con) {
		super(con, new EmpleadoMapper());
	}

	public EmpleadoRepository(Connection con, RowMapper<Empleado> mapper) {
		super(con, mapper);
	}

	@Override
	public String getTable() {
		return "empleados";
	}

	@Override
	public String[] getColumnNames() {
		return new String[] { "id_empleado", "nombre", "apellidos", "puesto", "sueldo" };
	}
	
	@Override
	public Integer getPrimaryKey(Empleado e) {
		return e.getId();
	}
	
	@Override
	public void setPrimaryKey(Empleado e, int id) {
		e.setId(id);
	}

	@Override
	public Object[] getInsertValues(Empleado e) {
		return new Object[] { e.getNombre(), e.getApellido(), e.getPuesto(), e.getSueldo() };
	}

	@Override
	public Object[] getUpdateValues(Empleado e) {
		return new Object[] { e.getNombre(), e.getApellido(), e.getPuesto(), e.getSueldo(), e.getId() };
	}
}
