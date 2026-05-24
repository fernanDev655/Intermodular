package com.example.concesionario.controller;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.concesionario.entity.Transaccion;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.repository.TransaccionRepository;

	@RestController
	@RequestMapping("/api/admin/transacciones")
	public class TransaccionController {
		private final DataSource ds;

	    public TransaccionController(DataSource ds) {
	    	this.ds = ds;
	    }
	    
	    @GetMapping
	    public List<Transaccion> index() throws SQLException {
	    	System.out.println("HOLA");
	    	try (Connection con = ds.getConnection()) {
	    	    TransaccionRepository repo = new TransaccionRepository(con);
	    	    return repo.findAll();
	    	 } catch (SQLException e) {
	    	        throw new DataAccessException(e);
	    	 }
	    }
	    
	    @GetMapping("/{id}")
	    public Transaccion show(@PathVariable int id) {
	        try (Connection con = ds.getConnection()) {
	        	TransaccionRepository repo = new TransaccionRepository(con);
	            return repo.find(id);
	        } catch (SQLException e) {
	            throw new DataAccessException(e);
	        }
	    }

}
