import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Junction table untuk many-to-many relationship antara RPS Pertemuan dan CPMK/Sub-CPMK
const PertemuanCPMK = sequelize.define('PertemuanCPMK', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pertemuan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cpmk_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sub_cpmk_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'pertemuan_cpmk',
    timestamps: false
});

export default PertemuanCPMK;
