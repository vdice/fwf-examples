export interface Config {
  origin: string,
  blockUntil: string,
  blockLocation: string,
  blockStatusCode: number,
  trackBlockedRequests: boolean
}

export interface RequestTacking {
  count: number
}
