package com.example.concesionario.controller;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.concesionario.dto.UserRequest;
import com.example.concesionario.entity.User;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {
	private final DataSource ds;
	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	public UserController(DataSource ds) {
		this.ds = ds;
	}

	@GetMapping
	public List<User> index() throws SQLException {
		System.out.println("HOLA");
		try (Connection con = ds.getConnection()) {
			UserRepository repo = new UserRepository(con);
			return repo.findAll();
		} catch (SQLException e) {
			throw new DataAccessException(e);
		}
	}

	@GetMapping("/{id}")
	public User show(@PathVariable int id) {
		try (Connection con = ds.getConnection()) {
			UserRepository repo = new UserRepository(con);
			return repo.find(id);
		} catch (SQLException e) {
			throw new DataAccessException(e);
		}
	}

	@PostMapping
	public User store(@RequestBody UserRequest req) {
		try (Connection con = ds.getConnection()) {
			UserRepository repo = new UserRepository(con);
			User user = map(req);
			repo.insert(user);
			return user;
		} catch (SQLException e) {
			throw new DataAccessException(e);
		}
	}

	@PutMapping("/{id}")
	public User update(@PathVariable int id, @RequestBody UserRequest req) {
		try (Connection con = ds.getConnection()) {
			UserRepository repo = new UserRepository(con);

			User actual = repo.find(id);
			if (actual == null) {
				throw new DataAccessException("Usuario no encontrado con id=" + id);
			}

			User user = new User(id, req.nombre(), req.apellidos(), req.dni(), req.telefono(), req.email(),
					actual.getPassword(),
					req.role() != null ? normalizeRole(req.role()) : actual.getRole());

			repo.update(user);
			return user;

		} catch (SQLException e) {
			throw new DataAccessException(e);
		}
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
	public void destroy(@PathVariable int id) {
		try (Connection con = ds.getConnection()) {
			UserRepository repo = new UserRepository(con);
			repo.delete(id);
		} catch (SQLException e) {
			throw new DataAccessException(e);
		}
	}

	private User map(UserRequest req) {
		String hashedPassword = encoder.encode(req.password());
		String role = req.role() != null && !req.role().isBlank() ? normalizeRole(req.role()) : "USER";
		return new User(null, req.nombre(), req.apellidos(), req.dni(), req.telefono(), req.email(), hashedPassword, role);
	}

	/** El frontend envía ADMIN pero la BD tiene ADMINISTRADOR como valor del ENUM */
	private String normalizeRole(String role) {
		if (role == null) return "USER";
		return switch (role.toUpperCase()) {
			case "ADMIN", "ADMINISTRADOR" -> "ADMINISTRADOR";
			case "MECANICO"               -> "MECANICO";
			case "COMERCIAL"              -> "COMERCIAL";
			default                       -> "USER";
		};
	}
}