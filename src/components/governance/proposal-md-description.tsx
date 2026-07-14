import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

// Proposal descriptions are attacker-controlled on-chain content. Allowlist
// schema (hast-util-sanitize defaults ≈ GitHub's): default tag set only — no
// svg/iframe/object/embed/form — extended with the className attributes the
// renderer's own chrome (prism tokens, heading anchors) needs. Everything not
// listed, including event handlers and javascript:/data: URLs, is stripped.
export const proposalMarkdownSchema: typeof defaultSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // className on `a` keeps the heading-anchor icon hidden/positioned as before
    a: [...(defaultSchema.attributes?.a ?? []), 'className'],
    code: ['className'],
    pre: ['className'],
    span: ['className'],
    div: ['className', 'dataCode'],
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
