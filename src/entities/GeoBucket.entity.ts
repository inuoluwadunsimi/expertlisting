import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Property } from './Property.entity';

@Entity('geo_bucket')
export class GeoBucket extends BaseEntity {
  @Column({ type: 'varchar', length: 20 })
  @Index('idx_geohash_prefix')
  geohash_prefix!: string;

  @OneToMany(() => Property, (property) => property.bucket)
  properties!: Property[];
}
