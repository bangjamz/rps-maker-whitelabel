import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PenilaianMK = sequelize.define('PenilaianMK', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rps_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    jenis_penilaian: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Tugas, Kuis, UTS, UAS, Praktikum, dll'
    },
    bobot_persentase: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Bobot dalam persen, total harus 100%'
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'penilaian_mk',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default PenilaianMK;
