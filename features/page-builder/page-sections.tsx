import { JsonLd } from '@/components/json-ld'
import type { Section, SectionIssue } from './model'
import { getSectionDefinition } from './registry'
import { SectionFrame } from './section-frame'

/**
 * Renders a validated list of sections. In preview, sections that failed
 * validation are shown as a visible warning (and carry `data-section-error` so
 * the site-check MCP crawler can flag them).
 */
export function PageSections({
  sections,
  issues = [],
  preview = false,
}: {
  sections: Section[]
  issues?: SectionIssue[]
  preview?: boolean
}) {
  const jsonLd = sections
    .map((section) => getSectionDefinition(section.type).jsonLd?.(section as never))
    .filter((data): data is Record<string, unknown> => Boolean(data))
    .map((data) => ({ '@context': 'https://schema.org', ...data }))

  return (
    <>
      {sections.map((section, index) => {
        const { component: Component } = getSectionDefinition(section.type)
        return (
          <SectionFrame
            key={section.key}
            type={section.type}
            anchor={section.anchor}
            tone={section.tone}
          >
            <Component section={section as never} index={index} />
          </SectionFrame>
        )
      })}
      {issues.length > 0 ? <SectionIssues issues={issues} visible={preview} /> : null}
      <JsonLd data={jsonLd} />
    </>
  )
}

function SectionIssues({ issues, visible }: { issues: SectionIssue[]; visible: boolean }) {
  if (!visible) {
    return <template data-section-error={issues.map((issue) => issue.type).join(',')} />
  }
  return (
    <div
      data-section-error
      className="mx-auto my-8 max-w-content rounded-card border border-danger p-6 text-sm"
    >
      <p className="font-semibold text-danger">
        {issues.length} section{issues.length === 1 ? '' : 's'} could not be rendered
      </p>
      <ul className="mt-3 grid gap-2 font-mono">
        {issues.map((issue) => (
          <li key={`${issue.index}-${issue.key}`}>
            #{issue.index} {issue.type}: {issue.issues.join('; ')}
          </li>
        ))}
      </ul>
    </div>
  )
}
