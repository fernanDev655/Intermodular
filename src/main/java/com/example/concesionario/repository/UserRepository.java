package com.example.concesionario.repository;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import com.example.concesionario.db.DB;
import com.example.concesionario.dto.UserResponse;
import com.example.concesionario.entity.User;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.mapper.RowMapper;
import com.example.concesionario.mapper.UserMapper;
import com.example.concesionario.mapper.UserResponseMapper;

public class UserRepository extends BaseRepository<User> {

	public UserRepository(Connection con) {
		super(con, new UserMapper());
	}

	public UserRepository(Connection con, RowMapper<User> mapper) {
		super(con, mapper);
	}

	@Override
	public String getTable() {
		return "users";
	}

	@Override
	public String[] getColumnNames() {
		return new String[] { "id", "nombre", "apellidos", "dni", "telefono", "email", "password", "role" };
	}

	@Override
	public Integer getPrimaryKey(User c) {
		return c.getId();
	}

	@Override
	public void setPrimaryKey(User c, int id) {
		c.setId(id);
	}

	@Override
	public Object[] getInsertValues(User c) {
		return new Object[] { c.getNombre(), c.getApellidos(), c.getDni(), c.getTelefono(), c.getEmail(), c.getPassword(), c.getRole() };
	}

	@Override
	public Object[] getUpdateValues(User c) {
		return new Object[] { c.getNombre(), c.getApellidos(), c.getDni(), c.getTelefono(), c.getEmail(), c.getPassword(), c.getRole(), c.getId() };
	}

	public UserResponse findResponseById(int id) {
		try {
			String sql = "SELECT id, nombre, email, role FROM users WHERE id = ?";
			return DB.queryOne(con, sql, new UserResponseMapper(), id);
		} catch (SQLException e) {
			throw new DataAccessException("Error al buscar el usuario con id " + id, e);
		}
	}

	public List<UserResponse> findAllResponses() {
		try {
			String sql = "SELECT id, nombre, email, role FROM users";
			return DB.queryMany(con, sql, new UserResponseMapper());
		} catch (SQLException e) {
			throw new DataAccessException("Error obteniendo los usuarios", e);
		}
	}

	public User findByEmail(String email) {
		try {
			String sql = "SELECT * FROM users WHERE email = ?";
			return DB.queryOne(con, sql, mapper, email);
		} catch (SQLException e) {
			throw new DataAccessException("Error al buscar el usuario con email " + email);
		}
	}
}
