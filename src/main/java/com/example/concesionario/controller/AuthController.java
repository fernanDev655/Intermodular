package com.example.concesionario.controller;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.concesionario.dto.UserResponse;
import com.example.concesionario.dto.auth.LoginRequest;
import com.example.concesionario.dto.auth.RegisterRequest;
import com.example.concesionario.entity.User;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.repository.UserRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(
	    origins = {"http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000"},
	    allowCredentials = "true",
	    allowedHeaders = "*",
	    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}
	)
public class AuthController extends BaseController {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final DataSource ds;

    public AuthController(DataSource ds) {
        super(ds);
        this.ds = ds;
    }

    // ==================== LOGIN ====================
    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest req, HttpSession session) {

        if (req.email() == null || req.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email es obligatorio");
        }
        if (req.password() == null || req.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña es obligatoria");
        }

        try (Connection con = ds.getConnection()) {
            UserRepository repo = new UserRepository(con);
            User user = repo.findByEmail(req.email());

            if (user == null || !encoder.matches(req.password(), user.getPassword())) {
            	System.out.println("Intento de login fallido para email: " + req.email());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
            }

            session.setAttribute("userId", user.getId());
            session.setAttribute("role", user.getRole());
            session.setAttribute("nombre", user.getNombre());

            return new UserResponse(
                user.getId(),
                user.getNombre(),
                user.getEmail(),
                user.getRole()
            );

        } catch (SQLException e) {
            throw new DataAccessException("Error al iniciar sesión: " + e.getMessage(), e);
        }
    }

    // ==================== REGISTER ====================
    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest req) {

        if (req.nombre() == null || req.nombre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio");
        }
        if (req.email() == null || req.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email es obligatorio");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "La contraseña debe tener al menos 6 caracteres");
        }

        try (Connection con = ds.getConnection()) {
            UserRepository repo = new UserRepository(con);

            User existente = repo.findByEmail(req.email());
            if (existente != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe una cuenta con este email");
            }

            User user = new User(
                null,
                req.nombre(),
                null,   // apellidos
                null,   // dni
                null,   // telefono
                req.email(),
                encoder.encode(req.password()),
                "USER"
            );

            // FIX: insert() devuelve el User con el id ya seteado via setPrimaryKey en BaseRepository
            User inserted = repo.insert(user);

            return new UserResponse(
                inserted.getId(),
                inserted.getNombre(),
                inserted.getEmail(),
                inserted.getRole()
            );

        } catch (SQLException e) {
            throw new DataAccessException("Error al registrar usuario: " + e.getMessage(), e);
        }
    }

    // ==================== LOGOUT ====================
    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }

    // ==================== CURRENT USER (ME) ====================
    @GetMapping("/me")
    public UserResponse me(HttpSession session) {

        Integer userId = (Integer) session.getAttribute("userId");

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No hay sesión activa");
        }

        try (Connection con = ds.getConnection()) {
            UserRepository repo = new UserRepository(con);
            UserResponse user = repo.findResponseById(userId);

            if (user == null) {
                session.invalidate();
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado");
            }

            return user;

        } catch (SQLException e) {
            throw new DataAccessException("Error al obtener usuario: " + e.getMessage(), e);
        }
    }

    // ==================== CHECK SESSION ====================
    @GetMapping("/check")
    public UserResponse checkSession(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        String role = (String) session.getAttribute("role");
        String nombre = (String) session.getAttribute("nombre");

        return new UserResponse(userId, nombre, null, role);
    }
}
