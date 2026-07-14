import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

// Prism's token-type vocabulary plus rehype-prism-plus line classes. An
// unlisted exotic token type only loses its syntax color — never allow a
// broader pattern here: free-form classes on attacker content resolve against
// the app's compiled Tailwind (fixed/inset-0/z-40/bg-background = a full-page
// overlay, i.e. stored UI redress).
const PRISM_CLASS =
  /^(?:token|code-line|code-highlight|line-number|highlight-line|comment|prolog|doctype|cdata|punctuation|namespace|property|tag|boolean|number|constant|symbol|deleted|inserted|selector|attr-name|string|char|builtin|operator|entity|url|atrule|attr-value|keyword|function|class-name|function-variable|regex|important|variable|bold|italic|parameter|interpolation|template-string|template-punctuation|literal-property|maybe-class-name|known-class-name|method|console|script|style|spread|arrow)$/

// Proposal descriptions are attacker-controlled on-chain content. Allowlist
// schema (hast-util-sanitize defaults ≈ GitHub's): default tag set only — no
// svg/iframe/object/embed/form — and className constrained to the exact
// values the renderer itself emits (discovered through the real pipeline).
// Everything else, including event handlers and javascript:/data: URLs, is
// stripped.
export const proposalMarkdownSchema: typeof defaultSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), ['className', 'anchor']],
    code: [['className', /^language-[\w-]+$/, 'code-highlight']],
    pre: [['className', /^language-[\w-]+$/]],
    span: [['className', PRISM_CLASS]],
    div: [['className', 'copied'], 'dataCode'],
  },
}

const ProposalMdDescription = ({ description }: { description: string }) => (
  <MDEditor.Markdown
    source={description}
    style={{ backgroundColor: 'transparent' }}
    // MDEditor pushes rehype-raw AFTER the rehypePlugins prop, so the
    // sanitizer goes through pluginsFilter — it must run last, once raw HTML
    // has been parsed into nodes the allowlist can strip.
    pluginsFilter={(type, plugins) =>
      type === 'rehype'
        ? [...plugins, [rehypeSanitize, proposalMarkdownSchema]]
        : plugins
    }
  />
)

export default ProposalMdDescription
