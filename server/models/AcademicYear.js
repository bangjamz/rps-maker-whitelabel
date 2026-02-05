
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AcademicYear = sequelize.define('AcademicYear', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'e.g., 2025/2026'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    active_semester: {
        type: DataTypes.ENUM('Ganjil', 'Genap'),
        allowNull: true,
        comment: 'Only relevant if is_active is true'
    }
}, {
    tableName: 'academic_years',
    timestamps: true
});

export default AcademicYear;
