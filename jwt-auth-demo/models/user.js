const mongoose = require('mongoose');

/**
 * Esquema de Usuario
 * - username: único, mínimo 3 caracteres
 * - email:    único, validado con regex
 * - password: almacenado como hash (bcrypt), nunca en texto plano
 * - timestamps: createdAt y updatedAt automáticos
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El username debe tener al menos 3 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

// Nunca exponer el password en respuestas JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
