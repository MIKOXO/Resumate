import TeamMember from '../models/TeamMember.js';

/**
 * @param {{ ownerId: string, name: string }} params
 * @returns {Promise<object>} Created TeamMember document
 */
export const createTeamMember = async ({ ownerId, name }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Team member name is required.');
    err.status = 400;
    throw err;
  }

  return TeamMember.create({ ownerId, name: name.trim() });
};

/**
 * @param {{ ownerId: string }} params
 * @returns {Promise<object[]>} TeamMember documents owned by the user
 */
export const listTeamMembers = async ({ ownerId }) => {
  return TeamMember.find({ ownerId });
};

/**
 * @param {{ ownerId: string, teamMemberId: string }} params
 * @returns {Promise<void>}
 */
export const deleteTeamMember = async ({ ownerId, teamMemberId }) => {
  const teamMember = await TeamMember.findOne({ _id: teamMemberId, ownerId });
  if (!teamMember) {
    const err = new Error('Team member not found.');
    err.status = 404;
    throw err;
  }

  // TODO: cascade-delete prospects once prospectService exists (Feature 06)

  await TeamMember.deleteOne({ _id: teamMemberId, ownerId });
};
