// Scaffolding. `npm run new:section` (or `npx plop section testimonial`).
// See .agents/skills for the conventions these templates encode.
import { execFileSync } from 'node:child_process'

/** "Pricing table" / "pricing-table-section" → base words ["pricing", "table"]. */
function words(input) {
  return String(input)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
    .filter((word, index, all) => !(word === 'section' && index === all.length - 1))
}

const camel = (input) =>
  words(input)
    .map((word, index) => (index === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join('')
const pascal = (input) =>
  words(input)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
const kebab = (input) => words(input).join('-')
const snake = (input) => words(input).join('_')
const title = (input) => {
  const label = words(input).join(' ')
  return label[0].toUpperCase() + label.slice(1)
}

/** Insert `line` directly above `marker` (keeping the marker for the next run). */
function insertAbove(marker, template) {
  return { pattern: new RegExp(`^([ \\t]*)(${marker.replace(/[/:-]/g, '\\$&')})`, 'm'), template }
}

export default function plop(plop) {
  plop.setHelper('sectionType', (name) => `${camel(name)}Section`)
  plop.setHelper('sectionFolder', (name) => `${kebab(name)}-section`)
  plop.setHelper('componentName', (name) => `${pascal(name)}Section`)
  plop.setHelper('directusCollection', (name) => `section_${snake(name)}`)
  plop.setHelper('sectionTitle', (name) => title(name))

  plop.setActionType('format', (answers, config) => {
    const files = config.files.map((file) => plop.renderString(file, answers))
    execFileSync('npx', ['biome', 'check', '--write', '--no-errors-on-unmatched', ...files], {
      stdio: 'inherit',
    })
    return `formatted ${files.length} files`
  })

  const dir = 'features/page-builder/sections/{{sectionFolder name}}'
  const files = [
    'model.ts',
    'section.tsx',
    'sample.ts',
    'markdown.ts',
    'query.ts',
    'schema.ts',
    'directus.ts',
    'index.ts',
  ]
  const registries = [
    'features/page-builder/model.ts',
    'features/page-builder/registry.ts',
    'features/page-builder/queries.ts',
    'sanity/schemas/sections.ts',
    'features/cms/directus/sections.ts',
  ]

  plop.setGenerator('section', {
    description:
      'Page-builder section: model, component, CMS schema, query, sample, markdown, registries',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Section name (e.g. "testimonial", "pricing table"):',
        validate: (value) => {
          if (words(value).length === 0) return 'Enter a name'
          if (!/^[a-z]/.test(camel(value))) return 'Start with a letter'
          return true
        },
      },
    ],
    actions: [
      ...files.map((file) => ({
        type: 'add',
        path: `${dir}/${file}`,
        templateFile: `templates/section/${file}.hbs`,
        abortOnFail: true,
      })),
      {
        type: 'modify',
        path: 'features/page-builder/model.ts',
        ...insertAbove(
          '// plop:model-imports',
          "$1import { {{sectionType name}}Model } from './sections/{{sectionFolder name}}/model'\n$1$2",
        ),
      },
      {
        type: 'modify',
        path: 'features/page-builder/model.ts',
        ...insertAbove('// plop:model-entries', '$1{{sectionType name}}Model,\n$1$2'),
      },
      {
        type: 'modify',
        path: 'features/page-builder/registry.ts',
        ...insertAbove(
          '// plop:registry-imports',
          "$1import { {{sectionType name}} } from './sections/{{sectionFolder name}}'\n$1$2",
        ),
      },
      {
        type: 'modify',
        path: 'features/page-builder/registry.ts',
        ...insertAbove('// plop:registry-entries', '$1{{sectionType name}},\n$1$2'),
      },
      {
        type: 'modify',
        path: 'features/page-builder/queries.ts',
        ...insertAbove(
          '// plop:query-imports',
          "$1import { {{sectionType name}}Query } from './sections/{{sectionFolder name}}/query'\n$1$2",
        ),
      },
      {
        type: 'modify',
        path: 'features/page-builder/queries.ts',
        ...insertAbove(
          '// plop:query-entries',
          '$1{{sectionType name}}: {{sectionType name}}Query,\n$1$2',
        ),
      },
      {
        type: 'modify',
        path: 'sanity/schemas/sections.ts',
        ...insertAbove(
          '// plop:schema-imports',
          "$1import { {{sectionType name}}Schema } from '@/features/page-builder/sections/{{sectionFolder name}}/schema'\n$1$2",
        ),
      },
      {
        type: 'modify',
        path: 'sanity/schemas/sections.ts',
        ...insertAbove('// plop:schema-entries', '$1{{sectionType name}}Schema,\n$1$2'),
      },
      {
        type: 'modify',
        path: 'features/cms/directus/sections.ts',
        ...insertAbove(
          '// plop:directus-imports',
          "$1import { {{sectionType name}}Directus } from '@/features/page-builder/sections/{{sectionFolder name}}/directus'\n$1$2",
        ),
      },
      {
        type: 'modify',
        path: 'features/cms/directus/sections.ts',
        ...insertAbove('// plop:directus-entries', '$1{{sectionType name}}Directus,\n$1$2'),
      },
      { type: 'format', files: [...files.map((file) => `${dir}/${file}`), ...registries] },
      (answers) =>
        [
          '',
          'Section scaffolded. Next:',
          '  1. Shape the content model in model.ts, then mirror it in schema.ts, query.ts, directus.ts and sample.ts',
          `  2. Build the component in section.tsx; preview it at /section-preview/${camel(answers.name)}Section`,
          '  3. npm run check (registry.test.ts verifies all registries agree)',
        ].join('\n'),
    ],
  })
}
