# 🔐 Sistema de Autenticación con JWT

Proyecto basado en la guía de freeCodeCamp:  
**"How to Build a Secure Authentication System with JWT and Refresh Tokens"**  
Implementado hasta el **Punto 4: Verificación de JWTs y Rutas Protegidas**.

---

## Estructura del proyecto

```
jwt-auth-demo/
├── server.js               # Punto de entrada, configuración Express
├── .env                    # Variables de entorno (NO subir a Git)
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── package.json
│
├── config/
│   └── db.js               # Conexión a MongoDB
│
├── models/
│   └── user.js             # Esquema de usuario (Mongoose)
│
├── middleware/
│   └── auth.js             # Verificación del JWT en cada request
│
└── routes/
    ├── auth.js             # POST /register  POST /login
    └── profile.js          # GET  /me  GET /dashboard  [protegidas]
```

---

## Puntos implementados de la guía

| Punto | Descripción | Estado |
|-------|-------------|--------|
| 1 | Entender JWTs (Header, Payload, Signature) | ✅ |
| 2 | Configurar el proyecto (Express, dependencias, estructura) | ✅ |
| 3 | Implementar autenticación JWT (register + login + hash) | ✅ |
| 4 | Verificar JWTs y proteger rutas (middleware + rutas privadas) | ✅ |

---

## Requisitos previos

- Node.js instalado
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratis) o MongoDB local

---

## Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia `.env.example` y renómbralo a `.env`, luego completa los valores:

```env
PORT=5000
MONGO_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster.mongodb.net/jwt_auth_db
JWT_SECRET=una_clave_secreta_larga_y_aleatoria
NODE_ENV=development
```

> **Cómo obtener MONGO_URI:** En MongoDB Atlas → tu cluster → Connect → Drivers → copia la URI y reemplaza `<password>` con tu contraseña.

### 3. Iniciar el servidor
```bash
# Desarrollo (con auto-reinicio)
npm run dev

# Producción
npm start
```

---

## Endpoints

### Públicos

#### `POST /api/auth/register`
Registra un nuevo usuario.

**Body (JSON):**
```json
{
  "username": "juanperez",
  "email": "juan@example.com",
  "password": "mipassword123"
}
```

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "665abc...",
    "username": "juanperez",
    "email": "juan@example.com",
    "createdAt": "2024-06-01T..."
  }
}
```

---

#### `POST /api/auth/login`
Inicia sesión y recibe un JWT (válido 15 minutos).

**Body (JSON):**
```json
{
  "email": "juan@example.com",
  "password": "mipassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15 minutos"
}
```

---

### Protegidas (requieren JWT)

Envía el token en el header:
```
Authorization: Bearer eyJhbGci...
```

#### `GET /api/profile/me`
Retorna los datos del usuario autenticado.

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "user": {
    "_id": "665abc...",
    "username": "juanperez",
    "email": "juan@example.com"
  }
}
```

---

#### `GET /api/profile/dashboard`
Recurso de ejemplo protegido por JWT.

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "message": "Bienvenido al dashboard, usuario juan@example.com",
  "data": {
    "userId": "665abc...",
    "acceso": "Autorizado",
    "timestamp": "2024-06-01T12:00:00.000Z"
  }
}
```

---

### Errores comunes de autenticación

| Error | Causa | Solución |
|-------|-------|----------|
| 401 "token no proporcionado" | Falta el header Authorization | Agregar `Authorization: Bearer <token>` |
| 401 "Token expirado" | El JWT venció (15 min) | Iniciar sesión nuevamente |
| 401 "Token inválido" | Token corrupto o firmado con otro secret | Verificar JWT_SECRET en .env |

---

## Probar con Postman

1. **Registrar:** POST `http://localhost:5000/api/auth/register`
2. **Login:** POST `http://localhost:5000/api/auth/login` → copiar el `token` de la respuesta
3. **Perfil:** GET `http://localhost:5000/api/profile/me`  
   → En Headers agregar: `Authorization` : `Bearer <token_copiado>`
4. **Sin token:** Llamar al perfil sin el header → debe devolver 401

---

## Conceptos clave implementados

**Hash de contraseña:** `bcrypt.hash(password, 10)` — el número 10 es el factor de coste. La contraseña nunca se guarda en texto plano.

**Generación del JWT:**
```
jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '15m' })
```
El token tiene 3 partes: `header.payload.signature` (separadas por puntos).

**Verificación del JWT:**
```
jwt.verify(token, JWT_SECRET)
```
Si la firma no coincide o expiró, lanza una excepción que el middleware captura.

**Mensaje genérico en login:** "Credenciales inválidas" — no se dice si el email o la contraseña fueron incorrectos. Esto evita enumerar usuarios.

---

## Próximos pasos (Punto 5 de la guía)

- Refresh Tokens con rotación
- Almacenamiento seguro en cookies HTTP-only
- Revocación de tokens en base de datos
- Logout seguro
