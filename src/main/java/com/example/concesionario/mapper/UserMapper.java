package com.example.concesionario.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import com.example.concesionario.entity.User;

public class UserMapper implements RowMapper<User> {

	@Override
	public User map(ResultSet rs) throws SQLException {
		return new User(
			rs.getInt("id"),
			rs.getString("nombre"),
			rs.getString("apellidos"),
			rs.getString("dni"),
			rs.getString("telefono"),
			rs.getString("email"),
			rs.getString("password"),
			rs.getString("role")
		);
	}
}
