import axios, { AxiosError, AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios'
import {
  IViewAreaStatusResponse,
  IViewAreaResponse,
  IDownloadResourceResponse,
  IViewAreaRequest,
  IViewAreaStatusRequest,
  IDownloadResourceRequest,
  IViewPointsOfInterestRequest,
  IViewPointsOfInterestResponse,
  IRouteStages,
  ResourceType,
} from '../typings/typings'

type Token = string;
export type GetTokenCb = () => Promise<Token>;
type ApiType = {
  init({ url, getTokenCb }: { url: string; getTokenCb: GetTokenCb }): void
  viewAreaRequest({
    siteKey,
        areaKey,
        estateFloorKey,
    resourceTypes    
  }: IViewAreaRequest): Promise<AxiosResponse<IViewAreaResponse>>
  viewAreaStatusRequest({
    siteKey,
    areaKey,
    estateFloorKey,
    timestamp,
    resourceTypes,
    timestampEnd,
    neighbourhoodKeys,
    deskFeatureIds,
  }: IViewAreaStatusRequest): Promise<AxiosResponse<IViewAreaStatusResponse>>
  downloadMapResourceRequest({
    resourceKey,
  }: IDownloadResourceRequest): Promise<AxiosResponse<IDownloadResourceResponse>>
  viewPointsOfInterestRequest({
    siteKey,
    areaKey,
    estateFloorKey,
    includeNodeTypes,
    excludeNodeTypes,
    nearestX,
    nearestY,
    numberOfResults,
  }: IViewPointsOfInterestRequest): Promise<AxiosResponse<IViewPointsOfInterestResponse>>
  findRouteStagesRequest(startResourceKey: string, endResourceKey: string): Promise<AxiosResponse<IRouteStages>>
}

export const api: ApiType = Api()

function Api() {
  let instance: AxiosInstance

  function create() {
    instance = axios.create()
  }

  function setApiUrl(url: string) {
    instance && (instance.defaults.baseURL = url)
  }

  function setGetTokenHelper(getTokenCb: GetTokenCb): void {
    const onRequest = async (config: AxiosRequestConfig) => {
      if (!config.headers) {
        return config
      }

      //  put the Token to the headers
      if (config.headers.common) config.headers.common['Authorization'] = await getTokenCb()

      // console.info(`[API request] [${JSON.stringify(config)}]`)
      return config
    }

    const onRequestError = (error: AxiosError): Promise<AxiosError> => {
      console.error(`[API request error] [${JSON.stringify(error)}]`)
      return Promise.reject(error)
    }

    if (!instance) {
      // console.info('[API error] No api instance defined')
    } else instance.interceptors.request.use(onRequest, onRequestError)
  }

  return {
    init({ url, getTokenCb }: { url: string; getTokenCb: GetTokenCb }) {
      create()
      setApiUrl(url)
      setGetTokenHelper(getTokenCb)
    },
    async viewAreaRequest({
      siteKey,
      areaKey,
      estateFloorKey,
      resourceTypes,
    }: IViewAreaRequest): Promise<AxiosResponse<IViewAreaResponse>> {
      return instance.post(`/api/Cmp/View/Area`, {
        siteKey,
        areaKey,
        estateFloorKey,
        resourceTypes,
      })
    },
    async viewAreaStatusRequest({
      siteKey,
      areaKey,
      estateFloorKey,
      timestamp,
      resourceTypes,
      timestampEnd,
      neighbourhoodKeys,
      deskFeatureIds,
    }: IViewAreaStatusRequest): Promise<AxiosResponse<IViewAreaStatusResponse>> {
      const filters = []

      if (neighbourhoodKeys && neighbourhoodKeys.length >= 1) {
        filters.push({ type: 'neighbourhoodKey', values: neighbourhoodKeys })
      }

      if (deskFeatureIds && deskFeatureIds.length >= 1) {
        filters.push({ type: 'deskFeaturesId', values: deskFeatureIds })
      }

      return instance.post(`/api/Cmp/Status/AreaStatus`, {
        siteKey,
        areaKey,
        estateFloorKey,
        timestamp: timestamp || null,
        timestampEnd: timestampEnd || null,
        allResources: true,
        resourceTypes: resourceTypes?.map((type: ResourceType) => ({ key: type })),
        filters,
      })
    },
    async downloadMapResourceRequest({
      resourceKey,
    }: IDownloadResourceRequest): Promise<AxiosResponse<IDownloadResourceResponse>> {
      return instance.post(`/api/Cmp/View/DownloadResource`, {
        resourceKey,
      })
    },
    async viewPointsOfInterestRequest({
      siteKey,
      areaKey,
      estateFloorKey,
      includeNodeTypes,
      excludeNodeTypes,
      nearestX,
      nearestY,
      numberOfResults,
    }: IViewPointsOfInterestRequest): Promise<AxiosResponse<IViewPointsOfInterestResponse>> {
      return instance.post(`/api/Cmp/View/PointOfInterest`, {
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
    },
    async findRouteStagesRequest(
      startResourceKey: string,
      endResourceKey: string
    ): Promise<AxiosResponse<IRouteStages>> {
      return instance.post(`/api/Cmp/Wayfind/FindRouteStages`, {
        startResourceKey,
        endResourceKey,
        siteKey: '1',
        accessibleRoute: false,
      })
    },
  }
}
