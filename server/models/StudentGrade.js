import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentGrade = sequelize.define('StudentGrade', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mahasiswa_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mahasiswa',
            key: 'id'
        }
    },
    mata_kuliah_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mata_kuliah',
            key: 'id'
        }
    },
    assessment_component_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'assessment_components',
            key: 'id'
        }
    },

    // Score input
    nilai_angka: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'Raw score (0-100)'
    },

    // Auto-calculated based on grade_scale
    nilai_huruf: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: 'Letter grade (A, A-, B+, etc.) - auto-calculated'
    },
    nilai_ip: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Grade point - auto-calculated'
    },

    // Metadata
    graded_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    graded_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'student_grades',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['mahasiswa_id', 'assessment_component_id']
        },
        {
            fields: ['mata_kuliah_id', 'mahasiswa_id']
        }
    ]
});

export default StudentGrade;
