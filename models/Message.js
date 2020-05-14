module.exports = function(sequelize, DataTypes) {
  const Messages = sequelize.define("Messages", {
    message: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    freezeTableName: true
  });

  Messages.associate = function(models) {
    Messages.belongsTo(models.Chats, {
      foreignKey: {
        allowNull: false
      },
      onDelete: "cascade"
    });
    Messages.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Messages;
};