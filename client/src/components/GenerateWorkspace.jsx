import { useState, useEffect } from 'react'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { useGeneration } from '@/hooks/useGeneration'
import DatePicker from '@/components/DatePicker'
import ResultCard from '@/components/ResultCard'
import { Skeleton } from '@/components/ui/skeleton'
import { inputClass, primaryBtn } from '@/lib/authUiHelpers'
import { cn } from '@/lib/utils'

const GenerateWorkspace = () => {
  const { list, selectedProspectId, selectedTeamMemberId } = useTeamMembers()
  const { status, error, resultBlob, resultFilename, generate, reset } = useGeneration()

  const [jobDescription, setJobDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [date, setDate] = useState(null)

  // Reset generation result only when prospect changes — form fields intentionally preserved
  useEffect(() => {
    reset()
  }, [selectedProspectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const prospect = list
    .flatMap((tm) => tm.prospects)
    .find((p) => p._id === selectedProspectId)

  const isGenerating = status === 'generating'
  const canGenerate = jobDescription.trim() && companyName.trim() && date && !isGenerating
  const hasAnyField = jobDescription || companyName || date

  const handleClear = () => {
    setJobDescription('')
    setCompanyName('')
    setDate(null)
  }

  const handleGenerate = () => {
    if (!canGenerate) return
    generate({
      teamMemberId: selectedTeamMemberId,
      prospectId: selectedProspectId,
      jobDescription: jobDescription.trim(),
      companyName: companyName.trim(),
      date,
    })
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-2xl w-full">
      <h2 className="text-base font-semibold text-primary">{prospect?.name ?? 'Prospect'}</h2>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. Acme Corp"
              className={cn(inputClass(false), isGenerating && 'cursor-not-allowed opacity-50')}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted">Date</label>
            <DatePicker value={date} onChange={setDate} disabled={isGenerating} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isGenerating}
            placeholder="Paste the job description here…"
            rows={8}
            className={cn(
              inputClass(false),
              'resize-y min-h-[120px] pr-3',
              isGenerating && 'cursor-not-allowed opacity-50',
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasAnyField || isGenerating}
            className={cn(
              'w-auto px-4 py-2 text-sm font-medium rounded-lg border border-default transition-colors',
              hasAnyField && !isGenerating
                ? 'text-muted hover:text-primary hover:bg-surface cursor-pointer'
                : 'cursor-not-allowed text-disabled',
            )}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(primaryBtn(!canGenerate), 'w-auto cursor-pointer px-6')}
          >
            Generate
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      )}

      {status === 'success' && resultBlob && (
        <ResultCard filename={resultFilename} blob={resultBlob} />
      )}

      {status === 'error' && error && (
        <div className="rounded-md border border-state-error bg-state-error-bg px-3 py-2 text-sm text-state-error">
          {error}
        </div>
      )}
    </div>
  )
}

export default GenerateWorkspace
