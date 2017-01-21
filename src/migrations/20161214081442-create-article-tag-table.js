module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('article_tags', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      articleId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'articles',
          key: 'id',
        },
        onUpdate: 'cascade',
      },
      tagId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'tags',
          key: 'id',
        },
        onUpdate: 'cascade',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down(queryInterface) {
    return queryInterface.dropTable('article_tags');
  },
};
