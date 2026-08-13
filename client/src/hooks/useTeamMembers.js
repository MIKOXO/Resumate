import { useSelector, useDispatch } from 'react-redux'
import {
  fetchTeamMembers,
  createTeamMember,
  deleteTeamMember,
  fetchProspectsForTeamMember,
  uploadProspect,
  replaceProspectResume,
  deleteProspect,
  toggleExpand,
  selectProspect,
  clearError,
} from '@/store/slices/teamMembersSlice'

export function useTeamMembers() {
  const dispatch = useDispatch()
  const { list, selectedProspectId, loading, error } = useSelector((s) => s.teamMembers)

  return {
    list,
    selectedProspectId,
    loading,
    error,
    fetchTeamMembers: () => dispatch(fetchTeamMembers()),
    createTeamMember: (name) => dispatch(createTeamMember(name)),
    deleteTeamMember: (teamMemberId) => dispatch(deleteTeamMember(teamMemberId)),
    fetchProspectsForTeamMember: (teamMemberId) => dispatch(fetchProspectsForTeamMember(teamMemberId)),
    uploadProspect: (teamMemberId, name, file) => dispatch(uploadProspect({ teamMemberId, name, file })),
    replaceProspectResume: (teamMemberId, prospectId, file) => dispatch(replaceProspectResume({ teamMemberId, prospectId, file })),
    deleteProspect: (teamMemberId, prospectId) => dispatch(deleteProspect({ teamMemberId, prospectId })),
    toggleExpand: (teamMemberId) => dispatch(toggleExpand(teamMemberId)),
    selectProspect: (prospectId) => dispatch(selectProspect(prospectId)),
    clearError: () => dispatch(clearError()),
  }
}
