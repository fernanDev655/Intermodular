package com.example.concesionario.controller;

import java.io.IOException;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.concesionario.dto.ImagenResponse;
import com.example.concesionario.entity.VehiculoImagen;
import com.example.concesionario.exception.DataAccessException;
import com.example.concesionario.helper.StorageHelper;
import com.example.concesionario.repository.VehiculoImagenRepository;
import com.example.concesionario.repository.VehiculoRepository;
import com.example.concesionario.validation.ImageValidator;

@RestController
@RequestMapping("/api/vehiculos/{vehiculoId}/imagenes")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000"},
    allowCredentials = "true",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}
)
public class VehiculoImagenController extends BaseController {

    private final StorageHelper storage;

    public VehiculoImagenController(DataSource ds, StorageHelper storage) {
        super(ds);
        this.storage = storage;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehiculoImagen store(@PathVariable int vehiculoId, @RequestParam("file") MultipartFile file) {
        try (Connection con = ds.getConnection()) {
            new VehiculoRepository(con).findOrThrow(vehiculoId);
            ImageValidator.validate(file);
            String url = storage.save(file, "vehiculo");
            VehiculoImagenRepository repo = new VehiculoImagenRepository(con);
            VehiculoImagen img = new VehiculoImagen(null, vehiculoId, url);
            return repo.insert(img);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping
    public VehiculoImagen replace(@PathVariable int vehiculoId, @RequestParam("file") MultipartFile file) {
        try (Connection con = ds.getConnection()) {
            new VehiculoRepository(con).findOrThrow(vehiculoId);
            ImageValidator.validate(file);
            VehiculoImagenRepository repo = new VehiculoImagenRepository(con);
            List<VehiculoImagen> imagenesAntiguas = repo.findAllByVehiculoId(vehiculoId);
            for (VehiculoImagen imgOld : imagenesAntiguas) {
                if (imgOld.getUrl() != null) {
                    storage.deleteByUrl(imgOld.getUrl());
                }
                repo.delete(imgOld.getId());
            }
            String url = storage.save(file, "vehiculo");
            VehiculoImagen img = new VehiculoImagen(null, vehiculoId, url);
            return repo.insert(img);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        try (Connection con = ds.getConnection()) {
            VehiculoImagenRepository repo = new VehiculoImagenRepository(con);
            VehiculoImagen img = repo.find(id);
            repo.delete(id);
            if (img != null && img.getUrl() != null) {
                storage.deleteByUrl(img.getUrl());
            }
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    @GetMapping
    public List<ImagenResponse> index(@PathVariable int vehiculoId) {
        try (Connection con = ds.getConnection()) {
            return new VehiculoImagenRepository(con).findByVehiculoId(vehiculoId);
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }
}