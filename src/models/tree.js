module.exports = (sequelize, DataTypes) => {
  const Tree = sequelize.define('Tree', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    tree: {
      allowNull: false,
      type: DataTypes.JSON,
    },
    userId: {
      allowNull: false,
      type: DataTypes.STRING,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
    classMethods: {
      associate() {

      },
    },
  });

  return Tree;
};
