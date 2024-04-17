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

    const invitedMembers = await User.findAll({ where: { email: { [Op.or]: allEmails } } }, { transaction: transaction });


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
     return res.status(200).json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const currentUserId = req.user.id;
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          through: {
            model: UserGroup,
            attributes: ["isAdmin"]
          },
        },
      ],
    });

    // Check if the group exists
    if (!group) {
      console.log(`Group with ID ${groupId} not found`);
      return res.status(404).json({ message: "Group not found" });
    }
    let isCurrentUserAdmin = false;
    const members = group.users.map((user) => {
      if (user.id === currentUserId) {
        isCurrentUserAdmin = user.usergroup ? user.usergroup.isAdmin : false;
      }
      return {
        id: user ? user.id : null,
        name: user ? user.name : null,
        isAdmin: user.usergroup ? user.usergroup.isAdmin : false, 
        groupId: groupId,
      };
    });
    console.log('group>>>>>>>>>>>>', group.users)
    return res
      .status(200)
      .json({ members, isCurrentUserAdmin });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const addNewMembers = async (req, res, next) => {
  try {
    const email = req.body.memberEmail;
    const groupId = req.body.groupid;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ msg: "No user Registered with that email", success: false });
    console.log('user', user);

    const member = await UserGroup.findOne({ where: { groupId, userId: user.id } })

    if (member) return res.status(404).json({ msg: "User Already present in the group", success: false })
    console.log('member', member);

    await UserGroup.create({ groupId, userId: user.id });
    res.status(201).json({ msg: "Member Added Successfully", success: true })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Some error occured ,Please try again", success: false, error })

  }

}

const makeAdmin = async (req, res, next) => {
  const { groupId, userId } = req.query;
  console.log('groupid', groupId)
  console.log('userid', userId)
  try {
    const userGroup = await UserGroup.findOne({ where: { groupId, userId } });
    if (!userGroup) {
      return res.status(404).json({ error: "User not found in the group" });
    }
    console.log('...........usergroup', userGroup)
    // Update the user's role to admin
    userGroup.isAdmin = true;
    await userGroup.save();

    res.status(200).json({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const removeUser = async (req, res, next) => {
  const { groupId, userId } = req.query;
  try {
    // Check if the user is a member of the group
    const userGroup = await UserGroup.findOne({ where: { groupId, userId } });
    if (!userGroup) {
      return res.status(404).json({ message: "User is not a member of the group" });
    }

    // Remove the user from the group
    await userGroup.destroy();

    res.status(200).json({ message: "User removed from the group successfully" });
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteGroup = async (req, res, next) => {
  const { groupId } = req.query;

  // Start a transaction
  const t = await sequelize.transaction();

  try {
    // Find the group by ID
    const group = await Group.findByPk(groupId, { transaction: t });
    if (!group) {
      await t.rollback(); // Rollback the transaction if the group is not found
      return res.status(404).json({ message: "Group not found" });
    }

    // Delete the associated messages
    await Message.destroy({ where: { groupId }, transaction: t });

    // Delete the group
    await group.destroy({ transaction: t });

    // Commit the transaction if everything is successful
    await t.commit();

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    // Rollback the transaction if an error occurs
    console.error("Error deleting group:", error);
    await t.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createNewGroup,
  getUserGroups,
  getGroupMembers,
  addNewMembers,
  makeAdmin,
  removeUser,
  deleteGroup
}