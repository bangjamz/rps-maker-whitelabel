import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin_institusi', 'dekan', 'kaprodi', 'dosen', 'mahasiswa'),
        allowNull: false,
        defaultValue: 'dosen'
    },
    nama_lengkap: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    institusi_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'For admin_institusi role'
    },
    fakultas_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'For dekan role'
    },
    prodi_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'For kaprodi, dosen, mahasiswa roles'
    },
    nidn: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'NIDN (Nomor Induk Dosen Nasional) atau NUPTK untuk dosen'
    },
    telepon: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Nomor telepon/HP'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        }
    }
});

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

export default User;
