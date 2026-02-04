import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DosenAssignment = sequelize.define('DosenAssignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dosen_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to User (role: dosen)'
    },
    mata_kuliah_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to MataKuliah'
    },
    assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to User (kaprodi who made the assignment)'
    },
    semester: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Semester, e.g., Ganjil, Genap'
    },
    tahun_ajaran: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Tahun ajaran, e.g., 2025/2026'
    },
    catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Catatan tambahan untuk assignment'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Status assignment (active/inactive)'
    }
}, {
    tableName: 'dosen_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['dosen_id', 'mata_kuliah_id', 'tahun_ajaran', 'semester'],
            name: 'unique_assignment_per_semester'
        }
    ]
});

export default DosenAssignment;
