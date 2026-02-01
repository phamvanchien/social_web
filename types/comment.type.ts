export interface CommentUser {
  id: number
  firstName: string
  lastName: string
  avatar: string
}

export interface ResponseCommentItem {
  id: number
  content: string
  like: number
  createdAt: string
  repliesCount: number
  userLiked: boolean
  user: CommentUser
}

export interface RequestCreateComment {
  postId: number
  content: string
  parentId?: number
}

export type CommentSortType = 'top' | 'all'

export interface RequestGetComments {
  postId: number
  page?: number
  size?: number
  sort?: CommentSortType
}

export interface RequestGetReplies {
  commentId: number
  page?: number
  size?: number
}

export interface ResponseCommentCount {
  count: number
}
