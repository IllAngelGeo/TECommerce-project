# Imagen oficial de Go
FROM golang:1.26

# Carpeta de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY go.mod ./
COPY go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto de la API
EXPOSE 8080

# Ejecutar la aplicación
CMD ["go", "run", "main.go"]
