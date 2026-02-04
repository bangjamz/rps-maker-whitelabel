import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AssessmentComponent = sequelize.define('AssessmentComponent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mata_kuliah_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mata_kuliah',
            key: 'id'
        }
    },
    semester: {
        type: DataTypes.ENUM('Ganjil', 'Genap'),
        allowNull: false
    },
    tahun_ajaran: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    // Component type determines which fields are used
    component_type: {
        type: DataTypes.ENUM('legacy', 'obe'),
        allowNull: false
    },

    // For LEGACY mode (traditional assessment)
    legacy_type: {
        type: DataTypes.ENUM('UTS', 'UAS', 'Praktikum', 'Tugas', 'Soft Skill'),
        allowNull: true
    },
    legacy_weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Percentage weight for legacy component (0-100)'
    },

    // For OBE mode (outcome-based assessment)
    sub_cpmk_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'sub_cpmk',
            key: 'id'
        },
        comment: 'Used when component_type = obe'
    },
    pertemuan_range: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Meeting range for assessment, e.g., "1-2", "1-3", "5" (flexible)'
    },
    obe_weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Percentage weight for OBE component (0-100)'
    },

    // Common fields
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'assessment_components',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['mata_kuliah_id', 'semester', 'tahun_ajaran']
        },
        {
            fields: ['component_type']
        }
    ]
});

export default AssessmentComponent;
