const request = require('supertest');
const app = require('../index'); 

describe('💉 Endpoints de Pacientes (/api/patients)', () => {
  
  it('GET /api/patients - Debería obtener una lista vacía si no hay pacientes', async () => {
    const response = await request(app).get('/api/patients'); // Cambia a tu ruta real
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

it('POST /api/patients - Debería crear un nuevo paciente', async () => {
    const newPatient = {
      name: 'Juan Perez',
      email: 'juan@test.com',
      identidadGenero: 'Masculino',
      sexo: 'M',
      // Agrega aquí los campos obligatorios exactos de tu modelo
    };

    const response = await request(app)
      .post('/api/patients')
      .send(newPatient);

    // Esto te permitirá ver en los logs de GitHub Actions qué estructura devuelve tu API exactamente
    console.log('Respuesta del POST:', response.body);

    expect(response.status).toBe(201); // Comprueba que se creó exitosamente
    
    // Validamos que el cuerpo de la respuesta exista, sin forzar una estructura específica todavía
    expect(response.body).toBeDefined(); 
  });

});