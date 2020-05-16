module.exports = function(sequelize, DataTypes) {
  const Messages = sequelize.define("Messages", {
    message: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
  };

  return Messages;
};