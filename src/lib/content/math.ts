const FENCED_CODE = /```[\s\S]*?```|~~~[\s\S]*?~~~/g
const INLINE_CODE = /`[^`\n]*`/g
const MATH = /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/

export function hasMathContent(body: string | null | undefined): boolean {
  if (!body) return false
  const text = body.replace(FENCED_CODE, '').replace(INLINE_CODE, '')
  return MATH.test(text)
}
