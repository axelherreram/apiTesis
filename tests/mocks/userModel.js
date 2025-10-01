// Mock del modelo User
const userMock = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findOrCreate: jest.fn()
};

module.exports = userMock;