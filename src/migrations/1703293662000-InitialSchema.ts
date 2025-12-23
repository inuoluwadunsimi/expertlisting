import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1703293662000 implements MigrationInterface {
  name = 'InitialSchema1703293662000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create geo_bucket table
    await queryRunner.query(`
      CREATE TABLE "geo_bucket" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "geohash_prefix" character varying(7) NOT NULL,
        CONSTRAINT "UQ_geo_bucket_geohash_prefix" UNIQUE ("geohash_prefix"),
        CONSTRAINT "PK_geo_bucket" PRIMARY KEY ("id")
      )
    `);

    // Create index on geohash_prefix
    await queryRunner.query(`
      CREATE INDEX "IDX_geo_bucket_geohash_prefix" ON "geo_bucket" ("geohash_prefix")
    `);

    // Create property table
    await queryRunner.query(`
      CREATE TABLE "property" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "title" character varying NOT NULL,
        "location_name" character varying NOT NULL,
        "normalized_location_name" text NOT NULL,
        "latitude" double precision NOT NULL,
        "longitude" double precision NOT NULL,
        "geohash" character varying(9) NOT NULL,
        "price" integer NOT NULL,
        "bedrooms" integer NOT NULL,
        "bathrooms" integer NOT NULL,
        "bucket_id" uuid NOT NULL,
        CONSTRAINT "PK_property" PRIMARY KEY ("id")
      )
    `);

    // Create indexes on property table
    await queryRunner.query(`
      CREATE INDEX "IDX_property_geohash" ON "property" ("geohash")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_bucket_id" ON "property" ("bucket_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_property_normalized_location_name" ON "property" ("normalized_location_name")
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "property"
      ADD CONSTRAINT "FK_property_bucket_id"
      FOREIGN KEY ("bucket_id")
      REFERENCES "geo_bucket"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "property" DROP CONSTRAINT "FK_property_bucket_id"
    `);

    // Drop property indexes
    await queryRunner.query(
      `DROP INDEX "IDX_property_normalized_location_name"`
    );
    await queryRunner.query(`DROP INDEX "IDX_property_bucket_id"`);
    await queryRunner.query(`DROP INDEX "IDX_property_geohash"`);

    // Drop property table
    await queryRunner.query(`DROP TABLE "property"`);

    // Drop geo_bucket index
    await queryRunner.query(`DROP INDEX "IDX_geo_bucket_geohash_prefix"`);

    // Drop geo_bucket table
    await queryRunner.query(`DROP TABLE "geo_bucket"`);
  }
}
