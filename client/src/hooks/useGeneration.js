import { useSelector, useDispatch } from 'react-redux'
import { generateResume, clearProspectResult } from '@/store/slices/generationSlice'

export function useGeneration() {
  const dispatch = useDispatch()
  const { status, error, operatingProspectId, results } = useSelector((s) => s.generation)

  return {
    status,
    error,
    operatingProspectId,
    results,
    generate: (params) => dispatch(generateResume(params)),
    clearResult: (prospectId) => dispatch(clearProspectResult(prospectId)),
  }
}
