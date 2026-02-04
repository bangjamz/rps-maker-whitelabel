import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GradeScale = sequelize.define('GradeScale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g., "Legacy Scale" or "OBE Scale"'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'grade_scales',
    timestamps: true,
    underscored: true
});

export default GradeScale;
