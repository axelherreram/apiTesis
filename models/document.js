const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");  

const Document = sequelize.define("document", {
  document_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'document'
});

module.exports = Document;
