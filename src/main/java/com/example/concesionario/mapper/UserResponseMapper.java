package com.example.concesionario.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import com.example.concesionario.dto.UserResponse;

public class UserResponseMapper implements RowMapper<UserResponse> {

	@Override
	public UserResponse map(ResultSet rs) throws SQLException {
		return new UserResponse(
			rs.getInt("id"),
			rs.getString("nombre"),
			rs.getString("email"),
			rs.getString("role")
		);
	}
}
