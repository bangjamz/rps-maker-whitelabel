import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RPSPertemuan = sequelize.define('RPSPertemuan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rps_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    minggu_ke: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sub_cpmk: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Sub-CPMK untuk pertemuan ini'
    },
    indikator: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    materi: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Materi pembelajaran'
    },
    metode_pembelajaran: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Diskusi, presentasi, praktikum, dll'
    },
    bentuk_pembelajaran: {
        type: DataTypes.ENUM('tatap_muka', 'daring_sinkronus', 'daring_asinkronus', 'hybrid'),
        defaultValue: 'tatap_muka'
    },
    jenis_pertemuan: {
        type: DataTypes.ENUM('regular', 'uts', 'uas', 'praktikum', 'seminar'),
        defaultValue: 'regular'
    },
    penugasan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bobot_penilaian: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Bobot dalam persen'
    },
    referensi: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'rps_pertemuan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['rps_id', 'minggu_ke']
        }
    ]
});

export default RPSPertemuan;
