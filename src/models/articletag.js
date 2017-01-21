module.exports = (sequelize, DataTypes) => {
  const ArticleTag = sequelize.define('ArticleTag', {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
    articleId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'articles',
        key: 'id',
      },
      onUpdate: 'cascade',
    },
    tagId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'tags',
        key: 'id',
      },
      onUpdate: 'cascade',
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
      tableName: 'article_tags'
    },
  });

  return ArticleTag;
};
