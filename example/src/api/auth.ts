import axios, { AxiosResponse } from 'axios'

const { REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET, REACT_APP_SHARD, REACT_APP_COOKIE, REACT_APP_TOKEN_URL } =
  process.env as Record<string, string>

if (!REACT_APP_CLIENT_ID || !REACT_APP_CLIENT_SECRET || !REACT_APP_SHARD || !REACT_APP_COOKIE || !REACT_APP_TOKEN_URL)
  throw Error(
    `Missing \`env\` values to run tbe App, please check your \`.env.local\` file. ${JSON.stringify(
      {
        REACT_APP_CLIENT_ID: REACT_APP_CLIENT_ID ? undefined : 'value missing',
        REACT_APP_CLIENT_SECRET: REACT_APP_CLIENT_SECRET ? undefined : 'value missing',
        REACT_APP_SHARD: REACT_APP_SHARD ? undefined : 'value missing',
        REACT_APP_COOKIE: REACT_APP_COOKIE ? undefined : 'value missing',
        REACT_APP_TOKEN_URL: REACT_APP_TOKEN_URL ? undefined : 'value missing',
      },
      null,
      2
    )}`
  )

interface FetchTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

const body = new URLSearchParams()
body.append('grant_type', 'client_credentials')
body.append('client_id', REACT_APP_CLIENT_ID)
body.append('client_secret', REACT_APP_CLIENT_SECRET)
body.append('scope', 'ConnectPlatform.full DeskBookingApi.full')
body.append('device_id', 'anyValue')
body.append('shard', REACT_APP_SHARD)

export const fetchToken = async (): Promise<AxiosResponse<FetchTokenResponse>> => {
  return await axios.post(REACT_APP_TOKEN_URL, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: REACT_APP_COOKIE,
    },
  })
}
