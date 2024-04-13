const User = require("../models/User");
const Group = require("../models/Group");
const Message = require("../models/Chat");
const UserGroup = require("../models/UserGroup");
const sequelize = require("../util/database");
const { Op } = require('sequelize');

const createNewGroup = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { groupName, allEmails } = req.body;
    const userId = req.user.id;
    const newGroup = await Group.create({ groupname: groupName }, { transaction: transaction });

    await UserGroup.create({ userId, groupId: newGroup.id, isAdmin: true }, { transaction: transaction });

    const invitedMembers = await User.findAll({ where: {email: { [Op.or]: allEmails }}}, {transaction: transaction });


    for (const member of invitedMembers) {
      await UserGroup.create(
        {
          isAdmin: false,
          userId: member.id,
          groupId: newGroup.id,
        },
        { transaction: transaction }
      );
    }

 await transaction.commit();
  return res.status(201).json({ message: 'successfully created', group: newGroup });
} catch (error) {
  await transaction.rollback();
  console.error("Error creating group:", error);
  return res.status(500).json({ message: "Failed to create group" });
  }
}
const getUserGroups = async (req, res) => {
  try {

    // console.log("req.user>>>>>>>>", req.user.id);
    const userGroups = await UserGroup.findAll({
      where: { userId: req.user.id },
      attributes: ["groupId"], // Only select the group IDs
    });

    // Extract group IDs from the fetched records
    const groupIds = userGroups.map((userGroup) => userGroup.groupId);

    // Find groups using the extracted group IDs
    const groups = await Group.findAll({
      where: { id: groupIds }, // Filter by group IDs associated with the user
      attributes: ["id", "groupname"], // Select only the 'id' and 'name' attributes
      order: [["createdAt", "ASC"]],
    });

    // Send the response with the groups
    res.status(200).json({ groups });
  } catch (error) {
    // Handle errors
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createNewGroup,
  getUserGroups
}