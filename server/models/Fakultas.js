import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Fakultas = sequelize.define('Fakultas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    institusi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to Institusi'
    },
    kode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Kode fakultas, e.g., FT, FKes'
    },
    nama: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Nama fakultas, e.g., Fakultas Teknik'
    },
    dekan_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to User (Dekan)'
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
    tableName: 'fakultas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['kode']
        }
    ]
});

export default Fakultas;
