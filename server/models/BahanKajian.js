
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BahanKajian = sequelize.define('BahanKajian', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prodi_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    kode_bk: {
        type: DataTypes.STRING(20),
        allowNull: false
        // Removed unique: true to allow different prodis to potentially have same code, 
        // though typically they should be unique within a prodi. 
        // We can enforce compound unique index if needed.
    },
    jenis: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Inti / Institusional / IPTEKS / dll'
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    bobot_min: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true
    },
    bobot_max: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true
    }
}, {
    tableName: 'bahan_kajian',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['prodi_id', 'kode_bk'],
            unique: true
        }
    ]
});

export default BahanKajian;
