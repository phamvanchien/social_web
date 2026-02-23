export interface UserResponseType {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar: string
  cover_photo: string
  lat?: string
  long?: string
}

export interface UserProfileStats {
  posts: number
  followers: number
  following: number
}

export interface UserProfileResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatar: string | null
  coverPhoto: string | null
  vote: number
  lang: string
  verifiedAt: boolean | null
  createdAt: string
  lat: number | null
  long: number | null
  stats: UserProfileStats
}