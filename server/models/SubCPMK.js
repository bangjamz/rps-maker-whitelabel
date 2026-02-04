import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubCPMK = sequelize.define('SubCPMK', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cpmk_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    kode_sub_cpmk: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    indikator: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    bobot_nilai: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Bobot persentase untuk penilaian'
    },
    is_template: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Sub-CPMK mostly created by dosen, not from master'
    }
}, {
    tableName: 'sub_cpmk',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default SubCPMK;
