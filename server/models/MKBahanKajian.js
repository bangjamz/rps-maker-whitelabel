import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Junction table untuk many-to-many relationship antara Mata Kuliah dan Bahan Kajian
const MKBahanKajian = sequelize.define('MKBahanKajian', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mata_kuliah_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bahan_kajian_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bobot_sks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Bobot SKS untuk BK ini dalam MK'
    }
}, {
    tableName: 'mk_bahan_kajian',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['mata_kuliah_id', 'bahan_kajian_id']
        }
    ]
});

export default MKBahanKajian;
