package com.example.concesionario.repository;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import com.example.concesionario.db.DB;
import com.example.concesionario.dto.VehiculoDetalleResponse;
import com.example.concesionario.dto.VehiculoResumen;
import com.example.concesionario.dto.VehiculoResumenResponse;
import com.example.concesionario.entity.Vehiculo;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.mapper.VehiculoMapper;
import com.example.concesionario.mapper.RowMapper;

public class VehiculoRepository extends BaseRepository<Vehiculo> {

	public VehiculoRepository(Connection con) {
		super(con, new VehiculoMapper());
	}

	public VehiculoRepository(Connection con, RowMapper<Vehiculo> mapper) {
		super(con, mapper);
	}

	@Override
	public String getTable() {
		return "vehiculos";
	}

	@Override
	public String[] getColumnNames() {
		return new String[] { "id", "marca", "modelo", "anyo", "precio", "categoria", "matricula", "descripcion" };
	}
	
	@Override
	public Integer getPrimaryKey(Vehiculo v) {
		return v.getId();
	}
	
	@Override
	public void setPrimaryKey(Vehiculo v, int id) {
		v.setId(id);
	}

	@Override
	public Object[] getInsertValues(Vehiculo v) {
		return new Object[] { v.getMarca(), v.getModelo(), v.getAnyo(), v.getPrecio(), v.getCategoria(), v.getMatricula(), v.getDescripcion() };
	}

	@Override
	public Object[] getUpdateValues(Vehiculo v) {
		return new Object[] { v.getMarca(), v.getModelo(), v.getAnyo(), v.getPrecio(), v.getCategoria(), v.getMatricula(), v.getDescripcion(), v.getId() };
	}
	
	public List<VehiculoResumen> findResumen() {
		String sql = """
			SELECT marca, modelo, anyo, precio, categoria
			FROM vehiculos
			ORDER BY marca
		""";
		
		try {
			return DB.queryMany(con, sql, rs ->
				new VehiculoResumen(
					rs.getString("marca"),
					rs.getString("modelo"),
					rs.getInt("anyo"),
					rs.getString("precio"),
					rs.getString("categoria")
				)
			);
		} catch (SQLException e) {
			throw new DataAccessException("Error al buscar el listado resumido de los vehiculos", e);
		}
	}
	
	public VehiculoDetalleResponse findDetalle(int vehiculoId, Integer userId) {

		// FIX: coma faltante entre v.modelo y v.anyo, y se quita el LEFT JOIN votos
		// que hace referencia a una tabla 'votos' que no existe en el schema actual.
		// También se corrige para que el método retorne el resultado (antes siempre retornaba null).
		String sql = """
				SELECT
				    v.id,
				    v.marca,
				    v.modelo,
				    v.anyo,
				    v.precio,
				    v.categoria,
				    v.matricula,
				    v.descripcion
				FROM vehiculos v
				WHERE v.id = ?
				GROUP BY v.id
		""";
		
		try {
			return DB.queryOne(con, sql, rs -> {
				VehiculoDetalleResponse v = new VehiculoDetalleResponse();
				v.id = rs.getInt("id");
				v.marca = rs.getString("marca");
				v.modelo = rs.getString("modelo");
				v.anyo = rs.getInt("anyo");
				v.precio = rs.getDouble("precio");
				v.categoria = rs.getString("categoria");
				v.matricula = rs.getString("matricula");
				v.descripcion = rs.getString("descripcion");
				v.imagenes = new VehiculoImagenRepository(con).findByVehiculoId(vehiculoId);
				return v;
			}, vehiculoId);
		    
		} catch (SQLException e) {
			throw new DataAccessException("Error al buscar el detalle del vehiculo con id " + vehiculoId, e);
		}
	}

	
	public List<VehiculoResumenResponse> findAllResumen() {

		String sql = """
				SELECT v.id, v.marca, v.modelo, v.anyo, 
				v.precio, v.categoria, v.matricula, v.descripcion, 
				(
					SELECT url
					FROM vehiculo_imagenes vi
					WHERE vi.vehiculo_id = v.id
					ORDER BY vi.id ASC
					LIMIT 1
				) AS imagen
				FROM vehiculos v
				ORDER BY v.marca
				""";

		try {
			return DB.queryMany(con, sql, 
				rs -> new VehiculoResumenResponse(
					rs.getInt("id"), 
					rs.getString("marca"),
					rs.getString("modelo"), 
					rs.getInt("anyo"),
					rs.getDouble("precio"),
					rs.getString("categoria"),
					rs.getString("matricula"),
					rs.getString("descripcion"),
					rs.getString("imagen")
				)
			);
			
		} catch (SQLException e) {
			throw new DataAccessException("Error obteniendo el resumen de vehiculos", e);
		}
	}

}
