import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';
import { AppDataSource } from '../data-source';
import { BaseEntity } from '../entities/BaseEntity';


export class GenericRepository<T extends BaseEntity> {
  protected repository: Repository<T>;

  constructor(entity: new () => T) {
    this.repository = AppDataSource.getRepository(entity);
  }


  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

 
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }


  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  
  async findBy(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.findBy(where);
  }

 
  create(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }

  /**
   * Save an entity to the database
   */
  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

 
  async createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

 
  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return this.findById(id);
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Delete entities matching the given criteria
   */
  async deleteBy(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repository.delete(where);
    return result.affected ?? 0;
  }

  /**
   * Count entities matching the given criteria
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Check if an entity exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } as FindOptionsWhere<T> });
    return count > 0;
  }

  /**
   * Get the underlying TypeORM repository for advanced queries
   */
  getRepository(): Repository<T> {
    return this.repository;
  }
}
