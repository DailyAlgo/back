export type Config = {
  db: {
    connectionLimit: number
    host: string
    port: number
    database: string
    user: string
    password: string
  },
  oauth: {
    CLIENT_ID:string
    CLIENT_SECRET:string
    RESPONSE_TYPE:string
    REDIRECT_URL:string
    REDIRECT_SIGNUP_URL:string
    REDIRECT_LOGIN_URL:string
    SCOPE:string
    ACCESS_TYPE:string
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
    CLIENT_ID:'-',
    CLIENT_SECRET:'-',
    RESPONSE_TYPE:'code',
    REDIRECT_URL:'http://localhost:8080/oauth/google/callback',
    REDIRECT_SIGNUP_URL:'http://localhost:8080/oauth/google/sign_up',
    REDIRECT_LOGIN_URL:'http://localhost:8080/oauth/google/sign_in',
    SCOPE:"email profile",
    ACCESS_TYPE:'offline',
  }
})

export default getConfig
