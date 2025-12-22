import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { GeoBucket } from './GeoBucket.entity';

@Entity('property')
export class Property extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'float' })
  latitude!: number;

  @Column({ type: 'float' })
  longitude!: number;

  @Column({ type: 'varchar', length: 20 })
  @Index('idx_geohash')
  geohash!: string;

  @Column({ type: 'varchar', length: 255 })
  normalized_location_name!: string;

  @Column({ type: 'varchar', length: 255 })
  location_name!: string;

  @Column({ type: 'integer' })
  price!: number;

  @Column({ type: 'integer' })
  bedrooms!: number;

  @Column({ type: 'integer' })
  bathrooms!: number;

  @Column({ type: 'uuid' })
  @Index('idx_bucket_id')
  bucket_id!: string;

  @ManyToOne(() => GeoBucket, (bucket) => bucket.properties)
  @JoinColumn({ name: 'bucket_id' })
  bucket!: GeoBucket;
}
