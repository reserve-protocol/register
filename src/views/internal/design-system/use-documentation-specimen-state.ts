import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export type DocumentationSpecimenDimension<Value extends string = string> = {
  defaultValue: Value
  values: readonly Value[]
}

export type DocumentationSpecimenSchema = Record<
  string,
  DocumentationSpecimenDimension
>

export type DocumentationSpecimenFallback = {
  dimension: string
  requestedValue: string
  fallbackValue: string
}

type DocumentationSpecimenState<Schema extends DocumentationSpecimenSchema> = {
  [Dimension in keyof Schema]: Schema[Dimension]['values'][number]
}

type ParsedDocumentationSpecimenState<
  Schema extends DocumentationSpecimenSchema,
> = {
  state: DocumentationSpecimenState<Schema>
  fallbacks: DocumentationSpecimenFallback[]
}

const namespacedKey = (sectionId: string, dimension: string) =>
  `${sectionId}.${dimension}`

const toSearch = (params: URLSearchParams) => {
  const value = params.toString()
  return value ? `?${value}` : ''
}

export const parseDocumentationSpecimenState = <
  Schema extends DocumentationSpecimenSchema,
>(
  sectionId: string,
  schema: Schema,
  search: string
): ParsedDocumentationSpecimenState<Schema> => {
  const params = new URLSearchParams(search)
  const state: Record<string, string> = {}
  const fallbacks: DocumentationSpecimenFallback[] = []

  for (const [dimension, definition] of Object.entries(schema)) {
    const requestedValue = params.get(namespacedKey(sectionId, dimension))

    if (
      requestedValue !== null &&
      !definition.values.includes(requestedValue)
    ) {
      state[dimension] = definition.defaultValue
      fallbacks.push({
        dimension,
        requestedValue,
        fallbackValue: definition.defaultValue,
      })
      continue
    }

    state[dimension] = requestedValue ?? definition.defaultValue
  }

  return {
    state: state as DocumentationSpecimenState<Schema>,
    fallbacks,
  }
}

export const updateDocumentationSpecimenSearch = <
  Schema extends DocumentationSpecimenSchema,
  Dimension extends keyof Schema & string,
>(
  sectionId: string,
  schema: Schema,
  search: string,
  dimension: Dimension,
  value: Schema[Dimension]['values'][number]
) => {
  const definition = schema[dimension]

  if (!definition.values.includes(value)) {
    throw new RangeError(`Unknown ${dimension} value: ${value}`)
  }

  const params = new URLSearchParams(search)
  const key = namespacedKey(sectionId, dimension)

  if (value === definition.defaultValue) {
    params.delete(key)
  } else {
    params.set(key, value)
  }

  return toSearch(params)
}

export const resetDocumentationSpecimenSearch = (
  sectionId: string,
  search: string
) => {
  const params = new URLSearchParams(search)
  const prefix = `${sectionId}.`

  for (const key of Array.from(params.keys())) {
    if (key.startsWith(prefix)) params.delete(key)
  }

  return toSearch(params)
}

export const createDocumentationSpecimenHref = ({
  pathname,
  search,
  hash,
}: {
  pathname: string
  search: string
  hash: string
}) => `${pathname}${search}${hash}`

export const useDocumentationSpecimenState = <
  Schema extends DocumentationSpecimenSchema,
>(
  sectionId: string,
  schema: Schema
) => {
  const location = useLocation()
  const navigate = useNavigate()
  const parsed = useMemo(
    () => parseDocumentationSpecimenState(sectionId, schema, location.search),
    [location.search, schema, sectionId]
  )

  const navigateToSearch = useCallback(
    (search: string) =>
      navigate(
        {
          pathname: location.pathname,
          search,
          hash: location.hash,
        },
        { replace: true, preventScrollReset: true }
      ),
    [location.hash, location.pathname, navigate]
  )

  const setValue = useCallback(
    <Dimension extends keyof Schema & string>(
      dimension: Dimension,
      value: Schema[Dimension]['values'][number]
    ) =>
      navigateToSearch(
        updateDocumentationSpecimenSearch(
          sectionId,
          schema,
          location.search,
          dimension,
          value
        )
      ),
    [location.search, navigateToSearch, schema, sectionId]
  )

  const reset = useCallback(
    () =>
      navigateToSearch(
        resetDocumentationSpecimenSearch(sectionId, location.search)
      ),
    [location.search, navigateToSearch, sectionId]
  )

  const isDefault =
    parsed.fallbacks.length === 0 &&
    Object.entries(schema).every(
      ([dimension, definition]) =>
        parsed.state[dimension] === definition.defaultValue
    )

  return {
    ...parsed,
    setValue,
    reset,
    isDefault,
    href: createDocumentationSpecimenHref(location),
  }
}
