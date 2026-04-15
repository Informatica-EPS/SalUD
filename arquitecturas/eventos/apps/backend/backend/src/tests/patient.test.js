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
      // Agrega los campos obligatorios de tu modelo Patient
    };

    const response = await request(app)
      .post('/api/patients')
      .send(newPatient);

    expect(response.status).toBe(201); // 201 Creado
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('juan@test.com');
  });

});