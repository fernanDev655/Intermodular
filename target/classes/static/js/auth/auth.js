import { api } from "/js/core/api.js";
import { app } from "/js/core/app.js";

export const auth = {

    currentUser: null,

    // Requiere autenticación
    async me() {

        if (this.currentUser) {
            return this.currentUser;
        }

        this.currentUser = await api.get("/api/me");

        return this.currentUser;
    },

    // Opcional (no redirige)
    async meOptional() {

		if (this.currentUser) {
			return this.currentUser;
		}
			
		try {
			this.currentUser =  await api.get("/api/me");
			return this.currentUser;	
		} catch (e) {
			if (e.status === 401) return null;
			throw e;
		}
    },
	
	// Register
	// Archivo: js/auth/auth.js

	async register(nombre, email, password) {
	    const response = await fetch("/api/register", {
	        method: "POST",
	        headers: {
	            "Content-Type": "application/json"
	        },
	        // AQUÍ ESTABA EL ERROR: 
	        // El servidor espera "nombre", si envías "name" llega como null.
	        body: JSON.stringify({ 
	            nombre: nombre, 
	            email: email, 
	            password: password 
	        })
	    });

	    if (!response.ok) {
	        // Esto permite que el catch de tu register.js capture el error
	        throw { status: response.status };
	    }
	},

    // Logout
    async logout() {
        await api.post("/api/logout");
        this.currentUser = null;
    },
	
	// Autenticado
	isAuthenticated() {
	    return !!this.currentUser;
	},

    // Rol
	hasRole(role) {
		return !!this.currentUser && this.currentUser.role === role;
	}
};