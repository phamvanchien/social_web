export interface RequestCreatePost {
  content?: string;
  scope?: number;
  type?: number;
  files?: File[]
  active?: number;
  longitude?: number
  latitude?: number
}

export interface ResponsePostItem {
  id: number
  content: string
  scope: number | null,
  like: number
  share: number
  created_at: string
  user: UserPost
  userLiked: boolean
  link: string
  longitude: number | null
  latitude: number | null
  files: [
    {
      id: number
      url: string
      type: number
    }
  ]
}

export interface UserPost {
  id: number
  first_name: string
  last_name: string
  avatar: string
}