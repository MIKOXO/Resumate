import { useSelector, useDispatch } from 'react-redux'
import { generateResume, resetGeneration } from '@/store/slices/generationSlice'

export function useGeneration() {
  const dispatch = useDispatch()
  const { status, error, resultBlob, resultFilename } = useSelector((s) => s.generation)

  return {
    status,
    error,
    resultBlob,
    resultFilename,
    generate: (params) => dispatch(generateResume(params)),
    reset: () => dispatch(resetGeneration()),
  }
}
