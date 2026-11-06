// RPC providers put the API key in the URL path (/v2/<key>, /v3/<key>); diagnostics and artifacts must never carry it.
export const redactSecrets = (text: string) =>
  text.replace(/(\/v[23]\/)[A-Za-z0-9_-]{8,}/g, '$1***')
