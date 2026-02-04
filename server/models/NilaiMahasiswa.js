import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const NilaiMahasiswa = sequelize.define('NilaiMahasiswa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    penilaian_mk_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mahasiswa_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cpl_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cpmk_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sub_cpmk_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nilai: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Nilai 0-100'
    },
    persentase_kontribusi: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Persentase kontribusi nilai ini terhadap CPL/CPMK'
    }
}, {
    tableName: 'nilai_mahasiswa',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['penilaian_mk_id', 'mahasiswa_id']
        },
        {
            fields: ['mahasiswa_id', 'cpl_id']
        }
    ]
});

export default NilaiMahasiswa;
