enum APP_AUTH {
  COOKIE_AUTH_KEY = 'auth_token',
  COOKIE_AUTH_USER = 'auth_user'
}

enum APP_ERROR {
  SERVER_ERROR = 'Đã xảy ra lỗi từ hệ thống, xin hãy thử lại sau ít phút',
  SERVER_MAINTAIN = 'Maintenance in progress. We’ll be back shortly!'
}

export {APP_AUTH, APP_ERROR}