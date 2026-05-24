package com.example.concesionario.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.example.concesionario.interceptor.AuthInterceptor;
import com.example.concesionario.interceptor.RoleInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final RoleInterceptor roleInterceptor;

    public WebConfig(AuthInterceptor authInterceptor,
                     RoleInterceptor roleInterceptor) {
        this.authInterceptor = authInterceptor;
        this.roleInterceptor = roleInterceptor;
        
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/admin/**", "/api/admin/**")
                .excludePathPatterns("/uploads/**");

        registry.addInterceptor(roleInterceptor)
                .addPathPatterns("/admin/**", "/api/admin/**")
                .excludePathPatterns("/uploads/**"); 
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String uploadsPath = Paths.get("uploads")
                .toAbsolutePath()
                .normalize()
                .toString();

        System.out.println("RUTA UPLOADS: " + uploadsPath); // 👈 DEBUG

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsPath + "/");
    }
}