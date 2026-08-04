import * as teamMemberService from '../services/teamMemberService.js';

export const create = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Team member name is required.' });
    }

    const teamMember = await teamMemberService.createTeamMember({
      ownerId: req.user,
      name: name.trim(),
    });
    res.status(201).json({ success: true, data: teamMember });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const teamMembers = await teamMemberService.listTeamMembers({ ownerId: req.user });
    res.json({ success: true, data: teamMembers });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await teamMemberService.deleteTeamMember({
      ownerId: req.user,
      teamMemberId: req.params.teamMemberId,
    });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
