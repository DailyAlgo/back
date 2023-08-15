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
    google: {
      host: string
      clientID: string
      clientSecret: string
      responseType: string
      redirectUri: string
      scope: string
      accessType: string
    }
    kakao: {
      host: string
      clientID: string
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
const getConfig = (): Config => ({
  db: {
    connectionLimit: 5,
    host: 'localhost',
    port: 3306,
    database: 'daily_algo',
    user: 'nodecrew',
    password: '1234',
  },
  oauth: {
    google: {
      host: 'https://accounts.google.com',
      clientID:
        '219272200879-bk59njugfdecjh5c63i7pc1i1me5pt1c.apps.googleusercontent.com',
      clientSecret: '-',
      responseType: 'code',
      redirectUri: 'http://localhost:8080/user/oauth/google/callback',
      scope: 'email profile',
      accessType: 'online',
    },
    kakao: {
      host: 'https://kauth.kakao.com',
      clientID: '086a0e452d2a5f01f3a73869f830f8fe',
      // get current url and redirect
      redirectUri: 'http://localhost:8080/user/kauth/kakao/callback',
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
