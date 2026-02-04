import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GradeScaleDetail = sequelize.define('GradeScaleDetail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    grade_scale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'grade_scales',
            key: 'id'
        }
    },
    huruf: {
        type: DataTypes.STRING(2),
        allowNull: false,
        comment: 'Grade letter: A, A-, B+, B, B-, C+, C, D, E'
    },
    min_angka: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Minimum score (0-100)'
    },
    max_angka: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Maximum score (0-100)'
    },
    ip: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        comment: 'Grade point (IP/GPA value)'
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order (A=1, A-=2, etc.)'
    }
}, {
    tableName: 'grade_scale_details',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['grade_scale_id', 'sort_order']
        }
    ]
});

export default GradeScaleDetail;
