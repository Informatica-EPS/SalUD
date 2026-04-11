const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("responde 200 y estado ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ status: "ok" }),
    );
  });
});
