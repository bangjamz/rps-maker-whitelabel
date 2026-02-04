import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Mahasiswa = sequelize.define('Mahasiswa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    npm: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nama: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    prodi_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    angkatan: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'mahasiswa',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Mahasiswa;
