import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Prodi = sequelize.define('Prodi', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fakultas_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to Fakultas'
    },
    kode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nama: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Nama program studi'
    },
    jenjang: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'S1',
        comment: 'Jenjang pendidikan: D3, S1, S2, S3, Profesi'
    },
    kaprodi_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to User (Kaprodi)'
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'prodi',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Prodi;

