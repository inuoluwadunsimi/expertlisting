import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { GeoBucket } from './GeoBucket.entity';

@Entity('property')
export class Property extends BaseEntity {
  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'float' })
  latitude!: number;

  @Column({ type: 'float' })
  longitude!: number;

  @Column({ type: 'varchar', length: 20 })
  @Index('idx_geohash')
  geohash!: string;

  @Column({ type: 'text' })
  normalized_location_name!: string;

  @Column({ type: 'text' })
  location_name!: string;

  @Column({ type: 'integer' })
  price!: number;

  @Column({ type: 'integer' })
  bedrooms!: number;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  coordinates!: string;

  @Column({ type: 'integer' })
  bathrooms!: number;

  @Column({ type: 'uuid' })
  @Index('idx_bucket_id')
  bucket_id!: string;

  @ManyToOne(() => GeoBucket, (bucket) => bucket.properties)
  @JoinColumn({ name: 'bucket_id' })
  bucket!: GeoBucket;
}
