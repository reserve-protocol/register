// Every mock calls this when it can't answer a request. The base fixture wires
// it to collect lines (prefixed `[E2E] unmocked`) so gaps surface in the report
// and fail @smoke tests. Detail is logged for debugging the specific gap.
export type UnmockedLogger = (message: string, detail?: Record<string, unknown>) => void
