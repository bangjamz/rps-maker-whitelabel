import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CPMK = sequelize.define('CPMK', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mata_kuliah_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cpl_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to CPL - optional mapping'
    },
    kode_cpmk: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_template: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'True = master template from kurikulum, False = dosen custom'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this CPMK'
    }
}, {
    tableName: 'cpmk',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['mata_kuliah_id', 'kode_cpmk']
        }
    ]
});

export default CPMK;
