import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1775477744123 implements MigrationInterface {
    name = 'Migration1775477744123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "totalAmount" float NOT NULL, "paymentMethod" varchar(50) NOT NULL DEFAULT ('cash_on_delivery'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "status" varchar(50) NOT NULL DEFAULT ('pending'), CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "totalAmount", "paymentMethod", "createdAt", "userId") SELECT "id", "totalAmount", "paymentMethod", "createdAt", "userId" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
        await queryRunner.query(`CREATE INDEX "IDX_048a28949bb332d397edb9b7ab" ON "products" ("stock") `);
        await queryRunner.query(`CREATE INDEX "IDX_75895eeb1903f8a17816dafe0a" ON "products" ("price") `);
        await queryRunner.query(`CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f4b9818a08b822a31493fdee9" ON "orders" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "IDX_ace513fa30d485cfd25c11a9e4"`);
        await queryRunner.query(`DROP INDEX "IDX_1f4b9818a08b822a31493fdee9"`);
        await queryRunner.query(`DROP INDEX "IDX_4c9fb58de893725258746385e1"`);
        await queryRunner.query(`DROP INDEX "IDX_75895eeb1903f8a17816dafe0a"`);
        await queryRunner.query(`DROP INDEX "IDX_048a28949bb332d397edb9b7ab"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "totalAmount" float NOT NULL, "paymentMethod" varchar(50) NOT NULL DEFAULT ('cash_on_delivery'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "orders"("id", "totalAmount", "paymentMethod", "createdAt", "userId") SELECT "id", "totalAmount", "paymentMethod", "createdAt", "userId" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
    }

}
