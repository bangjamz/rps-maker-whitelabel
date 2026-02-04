import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Dosen = sequelize.define('Dosen', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nidn: {
        type: DataTypes.STRING,
        unique: true
    },
    prodi_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'prodi',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('Aktif', 'Cuti', 'Keluar'),
        defaultValue: 'Aktif'
    }
}, {
    tableName: 'dosen',
    underscored: true
});

export default Dosen;
