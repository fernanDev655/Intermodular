package com.example.concesionario.controller;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.concesionario.dto.VehiculoResumenResponse;
import com.example.concesionario.entity.Vehiculo;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.repository.VehiculoRepository;

@RestController
@RequestMapping("/api/vehiculos")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000"},
    allowCredentials = "true",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}
)
public class VehiculoControllerRest extends BaseController {

    public VehiculoControllerRest(DataSource ds) {
        super(ds);
    }

    // GET /api/vehiculos — Listar todos
    @GetMapping
    public List<VehiculoResumenResponse> index() {
        try (Connection con = ds.getConnection()) {
            return new VehiculoController(con).findAllResumen();
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    // GET /api/vehiculos/{id} — Ver detalle
    @GetMapping("/{id}")
    public ResponseEntity<?> show(@PathVariable int id) {
        try (Connection con = ds.getConnection()) {
            var vehiculo = new VehiculoController(con).findDetalle(id, null);
            if (vehiculo == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(vehiculo);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    // POST /api/vehiculos — Crear vehículo
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Vehiculo store(@RequestBody Vehiculo vehiculo) {
        try (Connection con = ds.getConnection()) {
            VehiculoRepository repo = new VehiculoRepository(con);
            return repo.insert(vehiculo);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    // PUT /api/vehiculos/{id} — Actualizar vehículo
    @PutMapping("/{id}")
    public int update(@PathVariable int id, @RequestBody Vehiculo vehiculo) {
        try (Connection con = ds.getConnection()) {
            vehiculo.setId(id);
            VehiculoRepository repo = new VehiculoRepository(con);
            return repo.update(vehiculo);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    // DELETE /api/vehiculos/{id} — Eliminar vehículo
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void destroy(@PathVariable int id) {
        try (Connection con = ds.getConnection()) {
            VehiculoRepository repo = new VehiculoRepository(con);
            repo.delete(id);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }
}