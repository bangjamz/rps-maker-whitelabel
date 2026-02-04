import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProfilLulusan = sequelize.define('ProfilLulusan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prodi_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    kode_pl: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    unsur: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Sikap, Pengetahuan, Keterampilan Umum/Khusus'
    },
    sifat: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Wajib/Pilihan'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'profil_lulusan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['prodi_id', 'kode_pl']
        }
    ]
});

export default ProfilLulusan;
