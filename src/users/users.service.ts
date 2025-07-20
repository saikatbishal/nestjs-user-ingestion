import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { Role } from "./roles.enum";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ["id", "email", "name", "role", "createdAt", "updatedAt"],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ["id", "email", "name", "role", "createdAt", "updatedAt"],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateRole(id: number, role: Role): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);

    try {
      // Use delete instead of remove to avoid loading relations
      const result = await this.usersRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    } catch (error) {
      if (error.code === "23503") {
        // Foreign key constraint violation
        throw new Error(
          `Cannot delete user: User has associated records. Please remove associated documents first.`
        );
      }
      throw error;
    }
  }
}
