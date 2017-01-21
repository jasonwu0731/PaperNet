module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    title: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    content: {
      allowNull: true,
      type: DataTypes.TEXT,
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

  return Article;
};
