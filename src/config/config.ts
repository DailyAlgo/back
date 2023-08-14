export type Config = {
  db: {
    connectionLimit: number
    host: string
    port: number
    database: string
    user: string
    password: string
  }
  oauth: {
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_RESPONSE_TYPE: string
    GOOGLE_REDIRECT_URL: string
    GOOGLE_SCOPE: string
    GOOGLE_ACCESS_TYPE: string
  }
  kauth: {
    CLIENT_ID: string
    RESPONSE_TYPE: string
    REDIRECT_URL: string
    SCOPE: string
  }
}
const getConfig = (): Config => ({
  db: {
    connectionLimit: 5,
    host: 'localhost',
    port: 3306,
    database: 'daily_algo',
    user: 'test',
    password: '1234',
  },
  oauth: {
    GOOGLE_CLIENT_ID:
      '219272200879-bk59njugfdecjh5c63i7pc1i1me5pt1c.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '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',
    GOOGLE_RESPONSE_TYPE: 'code',
    GOOGLE_REDIRECT_URL: 'http://localhost:8080/user/oauth/google/callback',
    GOOGLE_SCOPE: 'email profile',
    GOOGLE_ACCESS_TYPE: 'online',
  },
  kauth: {
    CLIENT_ID: '086a0e452d2a5f01f3a73869f830f8fe',
    RESPONSE_TYPE: 'code',
    REDIRECT_URL: 'http://localhost:8080/user/kauth/kakao/callback',
    SCOPE: 'account_email,profile_nickname',
  },
})

export default getConfig
