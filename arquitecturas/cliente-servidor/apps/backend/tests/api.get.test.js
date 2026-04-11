const request = require("supertest");
const app = require("../src/app");

const expectOkOrNotFound = (response) => {
  expect([200, 404]).toContain(response.status);
};

describe("GET endpoints API", () => {
  it("GET /api/patients", async () => {
    const response = await request(app).get("/api/patients");
    expect(response.status).toBe(200);
  });

  it("GET /api/patients/:id", async () => {
    const response = await request(app).get("/api/patients/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/doctors", async () => {
    const response = await request(app).get("/api/doctors");
    expect(response.status).toBe(200);
  });

  it("GET /api/doctors/:id", async () => {
    const response = await request(app).get("/api/doctors/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/appointments", async () => {
    const response = await request(app).get("/api/appointments");
    expect(response.status).toBe(200);
  });

  it("GET /api/appointments/:id", async () => {
    const response = await request(app).get("/api/appointments/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/appointments/doctor/:id", async () => {
    const response = await request(app).get("/api/appointments/doctor/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/appointments/paciente/:id", async () => {
    const response = await request(app).get("/api/appointments/paciente/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/appointments/medical-records/:id", async () => {
    const response = await request(app).get("/api/appointments/medical-records/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/time-slots", async () => {
    const response = await request(app).get("/api/time-slots");
    expect(response.status).toBe(200);
  });

  it("GET /api/time-slots/:id", async () => {
    const response = await request(app).get("/api/time-slots/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/time-slots/available", async () => {
    const response = await request(app).get("/api/time-slots/available");
    expect(response.status).toBe(200);
  });

  it("GET /api/time-slots/scheduled", async () => {
    const response = await request(app).get("/api/time-slots/scheduled");
    expect(response.status).toBe(200);
  });

  it("GET /api/time-slots/doctor/:id", async () => {
    const response = await request(app).get("/api/time-slots/doctor/1");
    expectOkOrNotFound(response);
  });

  it("GET /api/time-slots/doctor/available/:id", async () => {
    const response = await request(app).get(
      "/api/time-slots/doctor/available/1",
    );
    expectOkOrNotFound(response);
  });
});
