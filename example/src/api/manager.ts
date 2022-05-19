import axios, { AxiosResponse } from 'axios'
import { IViewPointsOfInterestRequest, IViewPointsOfInterestResponse, IRouteStages } from 'map-web-core'

import { fetchToken } from '../api/auth'

const getAuthToken = async () => {
  const {
    data: { token_type, access_token },
  } = await fetchToken()

  localStorage.setItem('CMP_TOKEN', `${token_type} ${access_token}`)
}

void getAuthToken()

const instance = axios.create({
  baseURL: 'https://service.platformcluster.connectib.com/cmpmanager',
  headers: { Authorization: localStorage.getItem('CMP_TOKEN') || '' },
})

export const viewPointsOfInterestRequest = async ({
  siteKey,
  areaKey,
  estateFloorKey,
  includeNodeTypes,
  excludeNodeTypes,
  nearestX,
  nearestY,
  numberOfResults,
}: IViewPointsOfInterestRequest): Promise<AxiosResponse<IViewPointsOfInterestResponse>> =>
  instance.post(`/api/Cmp/View/PointOfInterest`, {
    siteKey,
    areaKey,
    estateFloorKey,
    includeNodeTypes,
    excludeNodeTypes,
    nearest: {
      x: nearestX,
      y: nearestY,
      numberOfResults,
    },
  })

export const findRouteStagesRequest = async (
  startResourceKey: string,
  endResourceKey: string
): Promise<AxiosResponse<IRouteStages>> =>
  instance.post(`/api/Cmp/Wayfind/FindRouteStages`, {
    startResourceKey,
    endResourceKey,
    siteKey: '1',
    accessibleRoute: false,
  })
