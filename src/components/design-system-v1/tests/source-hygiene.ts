import ts from 'typescript'

export const inspectStyleSource = (
  source: string,
  knownVariables: Set<string>,
  typeRecipes: Record<string, string>,
  allowedLiterals: ReadonlySet<string> = new Set(),
  colorTokens?: ReadonlySet<string>
) => {
  const findings: string[] = []
  const tree = ts.createSourceFile(
    'source.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const visit = (node: ts.Node) => {
    if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const literal = node.text
      if (!allowedLiterals.has(literal)) {
        if (
          /(?:^|[\s:'"\[])#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(\s*[\d.]/i.test(
            literal
          )
        )
          findings.push(`raw color: ${literal}`)
        if (
          /(?:^|[\s:])!?(?:bg|text|border|ring|fill|stroke)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?:\b|\/)/.test(
            literal
          )
        )
          findings.push(`palette utility: ${literal}`)
        const utilities = new Set(literal.split(/\s+/).map(utility => utility.replace(/^!/, '')))
        for (const [role, recipe] of Object.entries(typeRecipes)) {
          if (recipe.split(/\s+/).every(utility => utilities.has(utility)))
            findings.push(`duplicate typography ${role}: ${literal}`)
        }
      }
      for (const match of literal.matchAll(/var\((--[\w-]+)/g)) {
        if (!knownVariables.has(match[1]) && !match[1].startsWith('--radix-'))
          findings.push(`unknown variable: ${match[1]}`)
      }
      if (colorTokens) {
        for (const match of literal.matchAll(
          /(?:^|[\s:])!?(?:bg|text|border|ring(?:-offset)?|fill|stroke)-((?:surface|feedback|status-neutral|disabled|supporting|substrate)-[\w-]+)/g
        )) {
          if (!colorTokens.has(match[1]))
            findings.push(`unknown semantic utility: ${match[1]}`)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return findings
}
