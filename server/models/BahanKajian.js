import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BahanKajian = sequelize.define('BahanKajian', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    kode_bk: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    },
    jenis_bk: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Bahan Kajian Wajib Informatika, BK Tambahan (Opsional), BK Wajib SN Dikti, BK Wajib Umum'
    },
    bahan_kajian: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    bobot_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
    },
    bobot_max: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4
    },
    kode_kategori: {
        type: DataTypes.STRING(1),
        allowNull: false,
        comment: 'A = Wajib, B = Opsional, C = SN Dikti, D = Umum'
    }
}, {
    tableName: 'bahan_kajian',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default BahanKajian;
