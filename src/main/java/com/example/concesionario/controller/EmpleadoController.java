package com.example.concesionario.controller;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.web.bind.annotation.*;

import com.example.concesionario.entity.Empleado;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.repository.EmpleadoRepository;

@RestController
@RequestMapping("/api/admin/empleados")
public class EmpleadoController {
	private final DataSource ds;

    public EmpleadoController(DataSource ds) {
    	this.ds = ds;
    }
    
    @GetMapping
    public List<Empleado> index() throws SQLException {
    	System.out.println("HOLA");
    	try (Connection con = ds.getConnection()) {
    		EmpleadoRepository repo = new EmpleadoRepository(con);
    	    return repo.findAll();
    	 } catch (SQLException e) {
    	        throw new DataAccessException(e);
    	 }
    }
    
    @GetMapping("/{id}")
    public Empleado show(@PathVariable int id) {
        try (Connection con = ds.getConnection()) {
        	EmpleadoRepository repo = new EmpleadoRepository(con);
            return repo.find(id);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

   /* @PostMapping
    public Cliente store(@RequestBody ClienteRequest req) {
        try (Connection con = ds.getConnection()) {
        	ClienteRepository repo = new ClienteRepository(con);
        	Cliente pelicula = map(req);
            repo.insert(cliente);
            return cliente;
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    @PutMapping("/{id}")
    public Cliente update(@PathVariable int id, @RequestBody ClienteRequest req) {
        try (Connection con = ds.getConnection()) {
        	ClienteRepository repo = new ClienteRepository(con);
            Cliente cliente = map(req);
            cliente.setId(id);
            repo.update(cliente);
            return cliente;
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    @DeleteMapping("/{id}")
    public void destroy(@PathVariable int id) {
        try (Connection con = ds.getConnection()) {
        	ClienteRepository repo = new ClienteRepository(con);
            repo.delete(id);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }
    
    private Cliente map(ClienteRequest req) {
    	return new Cliente(
    		null,
    		req.titulo(),
    		req.anyo(),
    		req.duracion(),
    		req.sinopsis(),
    		req.directorId()
    	);
    }*/
}
