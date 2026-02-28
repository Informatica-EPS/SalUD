const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que React (puerto 3000) hable con Node (puerto 5000)

const PORT = 5000;

// Estos son tus datos "quemados"
const usuariosQuemados = [
  { id: 1, nombre: 'Goku', email: 'goku@test.com', status: 'Fake DB' },
  { id: 2, nombre: 'Vegeta', email: 'vegeta@test.com', status: 'Fake DB' },
  { id: 3, nombre: 'Bulma', email: 'bulma@test.com', status: 'Fake DB' }
];

// Ruta para el Frontend
app.get('/usuarios', (req, res) => {
  console.log("React ha pedido los usuarios...");
  res.json(usuariosQuemados); // Enviamos el JSON directamente
});

// Ruta de prueba rápida
app.get('/', (req, res) => {
  res.send('Backend funcionando con datos quemados 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});