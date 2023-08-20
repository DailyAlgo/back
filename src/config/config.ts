export type Config = {
  server: {
    host: string | undefined
  }
  db: {
    connectionLimit: number
    host: string | undefined
    port: number
    database: string | undefined
    user: string | undefined
    password: string | undefined
  }
  oauth: {
    google: {
      host: string
      clientID: string | undefined
      clientSecret: string | undefined
      responseType: string
      redirectUri: string
      scope: string
      accessType: string
    }
    kakao: {
      host: string
      clientID: string | undefined
      redirectUri: string
      scope: string
      responseType: string
    }
  }
  api: {
    google: {
      host: string
    }
    kakao: {
      host: string
    }
  }
}

const SERVER_URL =
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:8080'
    : process.env.SERVER_URL
const getConfig = (): Config => ({
  server: {
    host: SERVER_URL,
  },
  db: {
    connectionLimit: 5,
    host:
      process.env.NODE_ENV !== 'production'
        ? 'localhost'
        : process.env.DB_HOST_WRITE,
    port: 3306,
    database:
      process.env.NODE_ENV !== 'production'
        ? 'daily_algo'
        : process.env.DB_DATABASE,
    user: process.env.NODE_ENV !== 'production' ? 'test' : process.env.DB_USER,
    password:
      process.env.NODE_ENV !== 'production' ? '1234' : process.env.DB_PASSWORD,
  },
  oauth: {
    google: {
      host: 'https://accounts.google.com',
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      responseType: 'code',
      redirectUri: `${SERVER_URL}/user/oauth/google/callback`,
      scope: 'email profile',
      accessType: 'online',
    },
    kakao: {
      host: 'https://kauth.kakao.com',
      clientID: process.env.OAUTH_KAKAO_CLIENT_ID,
      // get current url and redirect
      redirectUri: `${SERVER_URL}/user/kauth/kakao/callback`,
      scope: 'account_email,profile_nickname',
      responseType: 'code',
    },
  },
  api: {
    google: {
      host: 'https://www.googleapis.com',
    },
    kakao: {
      host: 'https://kapi.kakao.com',
    },
  },
})

export default getConfig
