export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export type Session = {
  user?: SessionUser
} | null
