import { JWTService } from '../../infrastructure/auth/jwt.service';
import { UserRepository } from '../../domain/repositories/user/user.repository';
import { RoleRepository } from '../../domain/repositories/role/role.repository';
import { ApiKeyRepository } from '../../domain/repositories/apiKey/apiKey.repository';
import {
  IRegisterDTO,
  ILoginDTO,
  IAuthResponse,
} from '../../domain/interfaces/auth/auth.interface';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors/AppError';
import { randomString } from '../../shared/utils/helpers';

export class AuthService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;
  private apiKeyRepository: ApiKeyRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
    this.apiKeyRepository = new ApiKeyRepository();
  }

  /**
   * Register a new user
   */
  async register(data: IRegisterDTO): Promise<IAuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await JWTService.hashPassword(data.password);

    // Create user
    const user = await this.userRepository.createUser({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
    });

    // Assign default role (user)
    const userRole = await this.roleRepository.findBySlug('user');
    if (userRole) {
      await this.userRepository.assignRole(user.id, userRole.id);
    }

    // Generate tokens
    const tokens = JWTService.generateTokens({
      id: user.id,
      email: user.email,
      role: userRole?.slug || 'user',
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: ILoginDTO): Promise<IAuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    const isValidPassword = await JWTService.comparePassword(data.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Get user role
    const roles = await this.userRepository.getUserRoles(user.id);
    const primaryRole = roles[0] || 'user';

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = JWTService.generateTokens({
      id: user.id,
      email: user.email,
      role: primaryRole,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Get user profile with roles and permissions
   */
  async getProfile(userId: string) {
    const profile = await this.userRepository.findWithRolesAndPermissions(userId);
    if (!profile) {
      throw new NotFoundError('User not found');
    }

    return profile;
  }

  /**
   * Generate API key for user
   */
  async generateApiKey(
    userId: string,
    name: string,
    expiresInDays?: number
  ): Promise<{ id: string; key: string; name: string; expiresAt?: Date }> {
    const apiKey = `sk_${randomString(32)}`;

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const createdKey = await this.apiKeyRepository.createApiKey({
      user_id: userId,
      name,
      key: apiKey,
      expires_at: expiresAt,
    });

    return {
      id: createdKey.id,
      key: apiKey,
      name,
      expiresAt,
    };
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permissionSlug: string): Promise<boolean> {
    return await this.userRepository.hasPermission(userId, permissionSlug);
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: string, roleSlug: string): Promise<boolean> {
    return await this.userRepository.hasRole(userId, roleSlug);
  }
}
