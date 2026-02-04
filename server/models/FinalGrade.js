import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FinalGrade = sequelize.define('FinalGrade', {
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
    semester: {
        type: DataTypes.ENUM('Ganjil', 'Genap'),
        allowNull: false
    },
    tahun_ajaran: {
        type: DataTypes.STRING(10),
        allowNull: false
    },

    // Final calculated scores (weighted average)
    total_angka: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Weighted average of all component scores'
    },
    nilai_huruf: {
        type: DataTypes.STRING(2),
        allowNull: false,
        comment: 'Final letter grade'
    },
    nilai_ip: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        comment: 'Final grade point'
    },

    // Which grading system was used
    grading_system_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'grading_systems',
            key: 'id'
        }
    },

    // Approval workflow
    status: {
        type: DataTypes.ENUM('Active', 'Dropped', 'Completed'),
        allowNull: false,
        defaultValue: 'Active'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'final_grades',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['mahasiswa_id', 'mata_kuliah_id', 'semester', 'tahun_ajaran']
        },
        {
            fields: ['status']
        }
    ]
});

export default FinalGrade;
