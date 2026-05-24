package com.example.concesionario.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class RoleInterceptor implements HandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		HttpSession session = request.getSession(false);
		String path = request.getRequestURI();

		// 1. Verificación de sesión
		if (session == null || session.getAttribute("role") == null) {
			System.out.println("DEBUG [RoleInterceptor]: Acceso denegado. Sesión nula o sin rol para la ruta: " + path);
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			return false;
		}

		String role = (String) session.getAttribute("role");

		// DEBUG: Muestra qué rol intenta acceder y a dónde
		System.out.println("DEBUG [RoleInterceptor]: Usuario con rol [" + role + "] intentando acceder a: " + path);

		// 2. Lógica de acceso (Case Insensitive)

		// ADMIN tiene acceso total
		if ("ADMINISTRADOR".equalsIgnoreCase(role)) {
			return true;
		}

		// COMERCIAL tiene acceso a vehículos
		if ("COMERCIAL".equalsIgnoreCase(role)) {
			if (path.startsWith("/api/admin/vehiculos") || path.startsWith("/api/admin/vehiculo")) {
				return true;
			}
		}

		// NUEVA REGLA: Permitir que usuarios normales vean la colección
		if ("USER".equalsIgnoreCase(role) || "CLIENTE".equalsIgnoreCase(role)) {
			if (path.startsWith("/api/admin/vehiculos")) {
				return true;
			}
		}

		// Si no cae en ninguno de los anteriores, denegar
		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		return false;
	}
}