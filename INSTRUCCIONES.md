# Concesionario — Instrucciones de puesta en marcha

## 1. Importar la base de datos en phpMyAdmin

1. Abre **phpMyAdmin** → http://localhost/phpmyadmin
2. Crea una nueva base de datos llamada `concesionario` (collation: `utf8mb4_general_ci`)
3. Con la base de datos seleccionada, ve a la pestaña **Importar**
4. Sube el archivo `concesionario (1).sql` y haz clic en **Continuar**

## 2. Configurar la conexión

Edita `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/concesionario?useSSL=false&serverTimezone=Europe/Madrid&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=          ← pon aquí tu contraseña si la tienes
```

## 3. Arrancar la aplicación

```bash
./mvnw spring-boot:run
```

O desde Eclipse: botón derecho en `ConcesionarioApplication.java` → **Run As → Spring Boot App**

La app arranca en: **http://localhost:8088**

## 4. Usuarios de prueba (ya incluidos en el SQL)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| joseluis@algo.com | (su contraseña) | USER |
| mecanico@autoelite.es | (su contraseña) | MECANICO |
| comercial@autoelite.es | (su contraseña) | COMERCIAL |
| admin@autoelite.es | (su contraseña) | ADMINISTRADOR |

> Las contraseñas están hasheadas con BCrypt — usa las que registraste originalmente.
> Para crear nuevos usuarios usa http://localhost:8088/concesionario/register.html

---

## Bugs corregidos

| Archivo | Bug | Fix |
|---------|-----|-----|
| `User.java` | `setId(User id2)` — tipo incorrecto, nunca actualizaba el id | Corregido a `setId(Integer id)` |
| `AuthController.java` | `user.setId(id)` llamaba al método roto sin efecto | `User inserted = repo.insert(user)` — usa el objeto devuelto con el id ya asignado |
| `VehiculoRepository.findDetalle()` | Faltaba coma entre `v.modelo` y `v.anyo` en SQL | Añadida la coma |
| `VehiculoRepository.findDetalle()` | `LEFT JOIN votos` → tabla inexistente en el schema real | Eliminado el JOIN |
| `VehiculoRepository.findDetalle()` | El método **siempre retornaba `null`** (faltaba el return) | Corregido para retornar el resultado de `DB.queryOne` |
| `VehiculoController.java` | Mismos bugs de SQL y retorno null | Idem |
| `VehiculoImagenRepository.findAllByVehiculoId()` | Constructor `VehiculoImagen` recibía el SQL como argumento `url` | Corregido: valores del ResultSet pasados correctamente |
| `StorageHelper.java` | Guardaba en `/uploads` (ruta absoluta) pero `WebConfig` servía desde `uploads` (relativo) | Cambiado a ruta relativa para que coincidan |
| `application.properties` | Faltaban parámetros `useSSL`, `serverTimezone`, `allowPublicKeyRetrieval` | Añadidos para evitar errores de conexión con MariaDB/MySQL moderno |
