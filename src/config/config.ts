export type Config = {
  server: {
    host: string | undefined
  }
  cors: {
    options: {
      origin
      credentials: boolean
    }
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
  mail: {
    service: string
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  cache: {
    url: string
    socket: {
      port: number,
      host: string
    }
  }
}

const isDev = process.env.NODE_ENV !== 'production'
const SERVER_URL = isDev ? 'http://localhost:8080' : process.env.SERVER_URL
const whiteList = ["http://localhost", "http://13.209.184.61"]
const getConfig = (): Config => ({
  server: {
    host: SERVER_URL,
  },
  cors: {
    options: {
      origin: function (origin, callback) {
        if (whiteList.indexOf(origin) != -1) {
          callback(null, true)
        } else {
          callback(new Error("Origin Not Allowed"))
        }
      },
      credentials: true
    }
  },
  db: {
    connectionLimit: 5,
    host: isDev ? 'localhost' : process.env.DB_HOST_WRITE,
    port: 3306,
    database: isDev ? 'daily_algo' : process.env.DB_DATABASE,
    user: isDev ? 'test' : process.env.DB_USER,
    password: isDev ? '1234' : process.env.DB_PASSWORD,
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
  mail: {
    service: 'naver',
    host: 'localhost',
    port: 587,
    secure: false,
    auth: {
      user: '', // naver 아이디 입력,
      pass: '', // naver 비밀번호 입력,
    },
  },
  cache: {
    url: "redis://redis:6379",
    socket: {
      port: 6379,
      host: "localhost"
    }
  },
})

export default getConfig
