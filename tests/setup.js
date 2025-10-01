// Setup para las pruebas
global.console = {
  ...console,
  // Silenciar logs durante las pruebas
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};