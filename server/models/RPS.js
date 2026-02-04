import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RPS = sequelize.define('RPS', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mata_kuliah_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assignment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to DosenAssignment (null for templates)'
    },
    dosen_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Reference to User with role dosen'
    },
    is_template: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'True if this is a prodi template RPS, false for actual implementation'
    },
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to RPS template that this instance was created from'
    },
    semester: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Ganjil or Genap (null for templates)'
    },
    tahun_ajaran: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'e.g., 2025/2026 (null for templates)'
    },
    semester_akademik: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'e.g. 2026/2027 Ganjil (computed from tahun_ajaran + semester)'
    },
    jumlah_pertemuan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 16
    },
    capaian_pembelajaran: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Overall learning outcome description'
    },
    deskripsi_mk: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    referensi: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Pustaka/bibliografi'
    },
    status: {
        type: DataTypes.ENUM('draft', 'submitted', 'approved', 'revision', 'rejected'),
        defaultValue: 'draft'
    },
    catatan_kaprodi: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Feedback from kaprodi'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Kaprodi user ID who approved'
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'rps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default RPS;
