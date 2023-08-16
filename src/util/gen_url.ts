import qs from 'qs'
import getConfig from '../config/config'
import { Authorization, GAuth, KAuth } from '../controller/user'

const config = getConfig()

const getBase = (type: string, authorization: Authorization, path: string) => {
  return `${config[type][authorization].host}${path}`
}

const getURL = (base: string, query?: Record<string, string|undefined>): string => {
  if (query) {
    return `${base}?${qs.stringify(query)}`
  } else {
    return base
  }
}

export const KakaoAuth = (kAuth: KAuth): string => {
  return getURL(getBase('oauth', 'kakao', '/oauth/authorize'), {
    client_id: kAuth.clientID,
    response_type: kAuth.responseType,
    redirect_uri: kAuth.redirectUri,
    scope: kAuth.scope,
  })
}

export const KakaoLogin = (): string => {
  return getURL(getBase('oauth', 'kakao', '/oauth/token'))
}

export const GoogleAuth = (gAuth: GAuth): string => {
  return getURL(getBase('oauth', 'google', '/o/oauth2/v2/auth'), {
    client_id: gAuth.clientID,
    response_type: gAuth.responseType,
    redirect_uri: gAuth.redirectUri,
    scope: gAuth.scope,
    access_type: gAuth.accessType,
  })
}

export const GoogleLogin = (): string => {
  return getURL(getBase('oauth', 'google', '/o/oauth2/v2/auth'))
}

export const KakaoUserMe = (): string => {
  return getURL(getBase('api', 'kakao', '/v2/user/me'))
}

export const GoogleUserMe = (): string => {
  return getURL(getBase('api', 'google', '/oauth2/v2/userinfo'))
}
