import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Institusi = sequelize.define('Institusi', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Nama institusi, e.g., Institut Mahardika'
    },
    nama_lengkap: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nama lengkap institusi, e.g., Institut Teknologi dan Kesehatan Mahardika'
    },
    jenis: {
        type: DataTypes.ENUM('Institut', 'Universitas', 'Sekolah Tinggi', 'Politeknik', 'Akademi'),
        allowNull: false,
        defaultValue: 'Institut'
    },
    singkatan: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Singkatan institusi, misal: ITKM'
    },
    logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL logo institusi'
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    website: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    telepon: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'institusi',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Institusi;
