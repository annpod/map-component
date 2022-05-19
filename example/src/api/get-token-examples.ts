import { requestToken } from '../mobile/mobileMessageHandler'

export const getTokenFromLocalStorage = (): Promise<string> => {
  return new Promise<string>(function (resolve) {
    window.setTimeout(function () {
      resolve(localStorage.getItem('CMP_TOKEN') || '')
    }, 100)
  })
}

export const getTokenFromInterOps = (): Promise<string> => {
  requestToken()
  return new Promise<string>(function (resolve) {
    window.mobileWebViewApi = {}
    window.mobileWebViewApi.postToken = (token: string) => {
      resolve(token)
    }
  })
}
