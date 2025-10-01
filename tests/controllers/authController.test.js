// Mock de todos los módulos antes de cualquier importación
jest.mock('../../models/user', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findOrCreate: jest.fn()
}));

jest.mock('../../models/year', () => ({
  findOrCreate: jest.fn()
}));

jest.mock('../../sql/appLog', () => ({
  logActivity: jest.fn()
}));

jest.mock('../../services/emailService', () => ({
  sendEmailPasswordRecovery: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlink: jest.fn()
}));

// Ahora importar los módulos
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

const User = require('../../models/user');
const Year = require('../../models/year');
const { logActivity } = require('../../sql/appLog');
const { sendEmailPasswordRecovery } = require('../../services/emailService');

// Importar el controlador después de todos los mocks
const authController = require('../../controllers/authController');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
      file: null,
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default environment
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('registerUser', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      carnet: '12345',
      sede_id: 1,
      rol_id: 2,
      year: 2023
    };

    beforeEach(() => {
      // Mock Date para controlar el año actual
      jest.spyOn(global, 'Date').mockImplementation(() => ({
        getFullYear: () => 2023
      }));
    });

    afterEach(() => {
      global.Date.mockRestore();
    });

    test('should register a user successfully', async () => {
      req.body = validUserData;

      User.findOne.mockResolvedValue(null);
      Year.findOrCreate.mockResolvedValue([{ year_id: 1, year: 2023 }]);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ user_id: 1, ...validUserData });

      await authController.registerUser(req, res);

      expect(Year.findOrCreate).toHaveBeenCalledWith({
        where: { year: 2023 },
        defaults: { year: 2023 }
      });
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: validUserData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10);
      expect(User.create).toHaveBeenCalledWith({
        email: validUserData.email,
        password: 'hashedPassword',
        name: validUserData.name,
        carnet: validUserData.carnet,
        sede_id: validUserData.sede_id,
        rol_id: validUserData.rol_id,
        year_id: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario registrado exitosamente'
      });
    });

    test('should handle missing required fields', async () => {
      req.body = { email: 'test@example.com' };

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Faltan campos requeridos. Por favor, proporcione todos los datos necesarios.'
      });
    });

    test('should handle empty sede_id', async () => {
      req.body = { ...validUserData, sede_id: '' };

      User.findOne.mockResolvedValue(null);
      Year.findOrCreate.mockResolvedValue([{ year_id: 1, year: 2023 }]);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ user_id: 1, ...validUserData });

      await authController.registerUser(req, res);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        sede_id: null
      }));
    });

    test('should validate sede_id as valid number', async () => {
      req.body = { ...validUserData, sede_id: 'invalid' };

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'sede_id debe ser un número válido mayor a 0 o null.'
      });
    });

    test('should validate rol_id as valid number', async () => {
      req.body = { ...validUserData, rol_id: 'invalid' };

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'rol_id debe ser un número válido mayor a 0.'
      });
    });

    test('should validate year as valid number', async () => {
      req.body = { ...validUserData, year: 'invalid' };

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'year debe ser un número válido mayor a 0.'
      });
    });

    test('should not allow future years', async () => {
      req.body = { ...validUserData, year: 2025 };

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No se puede crear un año mayor al actual (2023).'
      });
    });

    test('should handle existing user', async () => {
      req.body = validUserData;

      User.findOne.mockResolvedValue({ user_id: 1, email: validUserData.email });

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: `Ya existe un usuario registrado con el correo electrónico ${validUserData.email}.`
      });
    });

    test('should handle database errors', async () => {
      req.body = validUserData;

      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error en el servidor. Por favor, intente más tarde.',
        error: 'Database error'
      });
    });

    test('should handle null sede_id values', async () => {
      const dataWithNullSede = { ...validUserData, sede_id: null };
      req.body = dataWithNullSede;

      User.findOne.mockResolvedValue(null);
      Year.findOrCreate.mockResolvedValue([{ year_id: 1, year: 2023 }]);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ user_id: 1, ...dataWithNullSede });

      await authController.registerUser(req, res);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        sede_id: null
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle string "null" sede_id', async () => {
      req.body = { ...validUserData, sede_id: 'null' };

      User.findOne.mockResolvedValue(null);
      Year.findOrCreate.mockResolvedValue([{ year_id: 1, year: 2023 }]);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ user_id: 1, ...validUserData });

      await authController.registerUser(req, res);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        sede_id: null
      }));
    });

    test('should handle zero values for validation', async () => {
      req.body = { ...validUserData, sede_id: 0, rol_id: 0, year: 0 };

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('loginUser', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      user_id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      rol_id: 1,
      sede_id: 1,
      active: true,
      passwordUpdate: false
    };

    test('should login user successfully', async () => {
      req.body = loginData;

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('test-token');
      logActivity.mockResolvedValue();

      await authController.loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          user: {
            user_id: mockUser.user_id,
            rol_id: mockUser.rol_id,
            sede_id: mockUser.sede_id
          }
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(logActivity).toHaveBeenCalledWith(
        mockUser.user_id,
        mockUser.sede_id,
        mockUser.name,
        'El usuario inició sesión',
        'Inicio de sesión'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Inicio de sesión exitoso',
        id: mockUser.user_id,
        sede: mockUser.sede_id,
        rol: mockUser.rol_id,
        passwordUpdate: mockUser.passwordUpdate,
        token: 'test-token'
      });
    });

    test('should handle user not found', async () => {
      req.body = loginData;

      User.findOne.mockResolvedValue(null);

      await authController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario no encontrado'
      });
    });

    test('should handle inactive user', async () => {
      req.body = loginData;

      User.findOne.mockResolvedValue({ ...mockUser, active: false });

      await authController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Acceso denegado. El usuario está deshabilitado.'
      });
    });

    test('should handle inactive user with numeric zero', async () => {
      req.body = loginData;

      User.findOne.mockResolvedValue({ ...mockUser, active: 0 });

      await authController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Acceso denegado. El usuario está deshabilitado.'
      });
    });

    test('should handle invalid password', async () => {
      req.body = loginData;

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await authController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Contraseña inválida'
      });
    });

    test('should not log activity for non-admin users', async () => {
      req.body = loginData;

      const nonAdminUser = { ...mockUser, rol_id: 2 };
      User.findOne.mockResolvedValue(nonAdminUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('test-token');

      await authController.loginUser(req, res);

      expect(logActivity).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should handle login errors', async () => {
      req.body = loginData;

      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('updatePassword', () => {
    const passwordData = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123'
    };

    const mockUser = {
      user_id: 1,
      name: 'Test User',
      sede_id: 1,
      password: 'hashedOldPassword',
      update: jest.fn()
    };

    beforeEach(() => {
      req.user = { user_id: 1 };
      req.body = passwordData;
    });

    test('should update password successfully', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
      logActivity.mockResolvedValue();

      await authController.updatePassword(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(passwordData.currentPassword, mockUser.password);
      expect(bcrypt.compare).toHaveBeenCalledWith(passwordData.newPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(passwordData.newPassword, 10);
      expect(mockUser.update).toHaveBeenCalledWith({
        password: 'hashedNewPassword',
        passwordUpdate: true
      });
      expect(logActivity).toHaveBeenCalledWith(
        1,
        mockUser.sede_id,
        mockUser.name,
        'El usuario actualizó su contraseña',
        'Actualización de contraseña'
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Contraseña actualizada exitosamente'
      });
    });

    test('should handle unauthorized user', async () => {
      req.user = null;

      await authController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
    });

    test('should handle undefined user', async () => {
      req.user = undefined;

      await authController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
    });

    test('should handle missing passwords', async () => {
      req.body = { currentPassword: 'test' };

      await authController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se requieren la contraseña actual y la nueva contraseña'
      });
    });

    test('should handle user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await authController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario no encontrado'
      });
    });

    test('should handle incorrect current password', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await authController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'La contraseña actual es incorrecta'
      });
    });

    test('should handle same old and new password', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      await authController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'La nueva contraseña no puede ser igual a la actual'
      });
    });

    test('should handle update password errors', async () => {
      User.findByPk.mockRejectedValue(new Error('Database error'));

      await authController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error en el servidor',
        error: 'Database error'
      });
    });
  });

  describe('updateProfilePhoto', () => {
    const mockUser = {
      user_id: 1,
      name: 'Test User',
      sede_id: 1,
      profilePhoto: 'old-photo.jpg'
    };

    beforeEach(() => {
      req.user = { user_id: 1 };
      req.file = { filename: 'new-photo.jpg' };
    });

    test('should update profile photo successfully', async () => {
      User.findOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce({
        ...mockUser,
        profilePhoto: 'new-photo.jpg'
      });
      User.update.mockResolvedValue();
      fs.existsSync.mockReturnValue(true);
      fs.unlink.mockImplementation((path, callback) => callback(null));
      logActivity.mockResolvedValue();

      await authController.updateProfilePhoto(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
      expect(User.update).toHaveBeenCalledWith(
        { profilePhoto: 'new-photo.jpg' },
        { where: { user_id: 1 } }
      );
      expect(logActivity).toHaveBeenCalledWith(
        1,
        mockUser.sede_id,
        mockUser.name,
        'El usuario actualizó su foto de perfil',
        'Actualización de foto de perfil'
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Foto de perfil actualizada exitosamente'
      });
    });

    test('should handle unauthorized user', async () => {
      req.user = null;

      await authController.updateProfilePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
    });

    test('should handle missing profile photo', async () => {
      req.file = null;

      await authController.updateProfilePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No se proporcionó una nueva foto de perfil'
      });
    });

    test('should handle undefined filename', async () => {
      req.file = { filename: undefined };

      await authController.updateProfilePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No se proporcionó una nueva foto de perfil'
      });
    });

    test('should handle user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await authController.updateProfilePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario no encontrado'
      });
    });

    test('should handle user without existing photo', async () => {
      const userWithoutPhoto = { ...mockUser, profilePhoto: null };
      User.findOne.mockResolvedValueOnce(userWithoutPhoto).mockResolvedValueOnce({
        ...userWithoutPhoto,
        profilePhoto: 'new-photo.jpg'
      });
      User.update.mockResolvedValue();
      logActivity.mockResolvedValue();

      await authController.updateProfilePhoto(req, res);

      expect(fs.existsSync).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Foto de perfil actualizada exitosamente'
      });
    });

    test('should handle file deletion errors', async () => {
      User.findOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce({
        ...mockUser,
        profilePhoto: 'new-photo.jpg'
      });
      User.update.mockResolvedValue();
      fs.existsSync.mockReturnValue(true);
      fs.unlink.mockImplementation((path, callback) => callback(new Error('File error')));
      logActivity.mockResolvedValue();

      await authController.updateProfilePhoto(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Foto de perfil actualizada exitosamente'
      });
    });

    test('should handle update profile photo errors', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.updateProfilePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error en el servidor',
        error: 'Database error'
      });
    });
  });

  describe('requestPasswordRecovery', () => {
    const recoveryData = {
      email: 'test@example.com'
    };

    const mockUser = {
      user_id: 1,
      email: 'test@example.com',
      name: 'Test User',
      update: jest.fn()
    };

    beforeEach(() => {
      req.body = recoveryData;
    });

    test('should request password recovery successfully', async () => {
      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('randomPassword')
      });
      bcrypt.hash.mockResolvedValue('hashedRandomPassword');
      sendEmailPasswordRecovery.mockResolvedValue();

      await authController.requestPasswordRecovery(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: recoveryData.email } });
      expect(crypto.randomBytes).toHaveBeenCalledWith(8);
      expect(bcrypt.hash).toHaveBeenCalledWith('randomPassword', 10);
      expect(mockUser.update).toHaveBeenCalledWith({ password: 'hashedRandomPassword' });
      expect(sendEmailPasswordRecovery).toHaveBeenCalledWith(
        'Recuperación de contraseña',
        'Tu nueva contraseña es: randomPassword',
        recoveryData.email,
        { nombre: mockUser.name, newPassword: 'randomPassword' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tu nueva contraseña ha sido enviada a tu correo electrónico.'
      });
    });

    test('should handle missing email', async () => {
      req.body = {};

      await authController.requestPasswordRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Por favor, proporcione un correo electrónico.'
      });
    });

    test('should handle invalid email format', async () => {
      req.body = { email: 'invalid-email' };

      await authController.requestPasswordRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Correo electrónico no válido.'
      });
    });

    test('should handle valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+label@example.org'
      ];

      for (const email of validEmails) {
        req.body = { email };
        User.findOne.mockResolvedValue(mockUser);
        crypto.randomBytes.mockReturnValue({
          toString: jest.fn().mockReturnValue('randomPassword')
        });
        bcrypt.hash.mockResolvedValue('hashedRandomPassword');
        sendEmailPasswordRecovery.mockResolvedValue();

        await authController.requestPasswordRecovery(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        jest.clearAllMocks();
      }
    });

    test('should handle user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await authController.requestPasswordRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No se encontró un usuario con ese correo electrónico.'
      });
    });

    test('should handle password recovery errors', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.requestPasswordRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error en el servidor. Por favor, intenta nuevamente más tarde.',
        error: 'Database error'
      });
    });

    test('should handle email service errors', async () => {
      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue('randomPassword')
      });
      bcrypt.hash.mockResolvedValue('hashedRandomPassword');
      sendEmailPasswordRecovery.mockRejectedValue(new Error('Email service error'));

      await authController.requestPasswordRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error en el servidor. Por favor, intenta nuevamente más tarde.',
        error: 'Email service error'
      });
    });
  });
});