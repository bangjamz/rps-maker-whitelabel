import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MataKuliah = sequelize.define('MataKuliah', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prodi_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    kode_mk: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nama_mk: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    sks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
    },
    semester: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    tableName: 'mata_kuliah',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default MataKuliah;
