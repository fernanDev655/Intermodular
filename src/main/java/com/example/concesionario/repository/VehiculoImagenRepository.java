package com.example.concesionario.repository;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import com.example.concesionario.db.DB;
import com.example.concesionario.dto.ImagenResponse;
import com.example.concesionario.entity.VehiculoImagen;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.mapper.RowMapper;
import com.example.concesionario.mapper.VehiculoImagenMapper;

public class VehiculoImagenRepository extends BaseRepository<VehiculoImagen> {

    public VehiculoImagenRepository(Connection con) {
        super(con, new VehiculoImagenMapper());
    }

    public VehiculoImagenRepository(Connection con, RowMapper<VehiculoImagen> mapper) {
        super(con, mapper);
    }

    @Override
    public String getTable() {
        return "vehiculo_imagenes";
    }

    @Override
    public String[] getColumnNames() {
        return new String[] { "id", "vehiculo_id", "url" };
    }

    @Override
    public Integer getPrimaryKey(VehiculoImagen v) {
        return v.getId();
    }

    @Override
    public void setPrimaryKey(VehiculoImagen v, int id) {
        v.setId(id);
    }

    @Override
    public Object[] getInsertValues(VehiculoImagen v) {
        return new Object[] { v.getVehiculoId(), v.getUrl() };
    }

    @Override
    public Object[] getUpdateValues(VehiculoImagen v) {
        return new Object[] { v.getVehiculoId(), v.getUrl(), v.getId() };
    }

    public List<ImagenResponse> findByVehiculoId(int vehiculoId) {
        String sql = """
                    SELECT id, url
                    FROM vehiculo_imagenes 
                    WHERE vehiculo_id = ?
                    ORDER BY id ASC
                """;
        try {
            return DB.queryMany(con, sql, rs -> new ImagenResponse(
                rs.getInt("id"), 
                rs.getString("url")
            ), vehiculoId);

        } catch (SQLException e) {
            throw new DataAccessException("Error obteniendo las imágenes del vehículo");
        }
    }

    public List<VehiculoImagen> findAllByVehiculoId(int vehiculoId) {
        String sql = """
                    SELECT id, vehiculo_id, url
                    FROM vehiculo_imagenes 
                    WHERE vehiculo_id = ?
                    ORDER BY id ASC
                """;
        try {
            // FIX: constructor llamado correctamente con los valores del ResultSet
            return DB.queryMany(con, sql, rs -> {
                VehiculoImagen vi = new VehiculoImagen(
                    rs.getInt("id"),
                    rs.getInt("vehiculo_id"),
                    rs.getString("url")
                );
                return vi;
            }, vehiculoId);

        } catch (SQLException e) {
            throw new DataAccessException("Error obteniendo las imágenes del vehículo");
        }
    }
}
