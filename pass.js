import crypto from 'crypto';

// La contraseña en texto plano
const password = "s0yM4RT1NG4LV4N22";

// Crea un objeto hash SHA-256
const sha256 = crypto.createHash('sha256');

// Actualiza el hash con la contraseña en formato UTF-8
sha256.update(password, 'utf8');

// Obtiene la contraseña digerida en formato hexadecimal
const digestedPassword = sha256.digest('hex');

console.log("Contraseña digerida:", digestedPassword);