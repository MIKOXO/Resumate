import { useSelector, useDispatch } from 'react-redux'
import {
  fetchProspects,
  uploadProspect,
  replaceProspectResume,
  deleteProspect,
  selectProspect,
  clearSelectedProspect,
  clearError,
} from '@/store/slices/prospectsSlice'

export function useProspects() {
  const dispatch = useDispatch()
  const { list, selectedProspectId, loading, error } = useSelector((s) => s.prospects)

  return {
    list,
    selectedProspectId,
    loading,
    error,
    fetchProspects: () => dispatch(fetchProspects()),
    uploadProspect: (name, file) => dispatch(uploadProspect({ name, file })),
    replaceProspectResume: (prospectId, file) => dispatch(replaceProspectResume({ prospectId, file })),
    deleteProspect: (prospectId) => dispatch(deleteProspect(prospectId)),
    selectProspect: (prospectId) => dispatch(selectProspect(prospectId)),
    clearSelectedProspect: () => dispatch(clearSelectedProspect()),
    clearError: () => dispatch(clearError()),
  }
}