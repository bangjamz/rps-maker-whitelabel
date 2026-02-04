import sequelize from './config/database.js';

async function fixSchema() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected');

        console.log('Fixing bentuk_pembelajaran column...');

        // Drop the column and recreate it as JSON
        await sequelize.query(`
            ALTER TABLE rps_pertemuan DROP COLUMN IF EXISTS bentuk_pembelajaran CASCADE;
        `);
        console.log('✅ Dropped old column');

        await sequelize.query(`
            ALTER TABLE rps_pertemuan ADD COLUMN bentuk_pembelajaran JSON DEFAULT '[]';
        `);
        console.log('✅ Added new JSON column');

        // Add link_daring if it doesn't exist
        await sequelize.query(`
            ALTER TABLE rps_pertemuan ADD COLUMN IF NOT EXISTS link_daring VARCHAR(512);
        `);
        console.log('✅ Added link_daring column');

        // Drop old enum type if exists
        await sequelize.query(`
            DROP TYPE IF EXISTS enum_rps_pertemuan_bentuk_pembelajaran CASCADE;
        `);
        console.log('✅ Dropped old enum type');

        console.log('🎉 Database schema fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixSchema();
