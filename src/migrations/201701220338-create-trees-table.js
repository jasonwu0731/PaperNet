module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('trees', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      title: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      author: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      url: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      children: {
        allowNull: true,
        type: Sequelize.ARRAY,
      },
      parent: {
        allowNull: true,
        type: Sequelize.ARRAY,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
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
    return queryInterface.dropTable('trees');
  },
};
