import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GradingSystem = sequelize.define('GradingSystem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prodi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'prodi',
            key: 'id'
        }
    },
    tahun_ajaran: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    semester: {
        type: DataTypes.ENUM('Ganjil', 'Genap'),
        allowNull: false
    },
    system_type: {
        type: DataTypes.ENUM('legacy', 'obe'),
        allowNull: false,
        defaultValue: 'obe',
        defaultValue: 'obe'
    },
    grade_scale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'grade_scales',
            key: 'id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'grading_systems',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['prodi_id', 'tahun_ajaran', 'semester']
        }
    ]
});

export default GradingSystem;
