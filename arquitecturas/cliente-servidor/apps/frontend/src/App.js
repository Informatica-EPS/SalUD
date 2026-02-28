import React, { useEffect, useState } from 'react';

function App() {
  const [usuarios, setUsuarios] = useState([]); // Aquí guardaremos la lista
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pedimos los datos al backend
    fetch('http://localhost:5000/usuarios') 
      .then(response => response.json())
      .then(data => setUsuarios(data))
      .catch(err => setError("No se pudo conectar con el backend"));
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Lista de Usuarios (Desde PostgreSQL)</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {usuarios.map(user => (
          <li key={user.id} style={{ background: '#eee', margin: '10px', padding: '10px', borderRadius: '5px' }}>
            <strong>{user.nombre}</strong> - {user.email}
          </li>
        ))}
      </ul>
      
      {usuarios.length === 0 && !error && <p>Cargando datos...</p>}
    </div>
  );
}

export default App;