import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from './apiController'
import { getMapInitialSize, svgParser } from '../display/utils'
import { IDictionary, IResource, IResourceStatus, ResourceType } from '../typings/typings'

interface IProps {
  siteKey?: string
  areaKey?: string
  estateFloorKey?: string
  resourceTypes?: ResourceType[]
  futureStartTimestamp?: string | null
  futureEndTimestamp?: string | null
  fetchAreaStatusIntervalMs?: number
  neighbourhoodKeys?: string[]
  deskFeatureIds?: string[]
}

export interface IStateManager {
  mapImageUrl: string
  resources: IDictionary<IResource>
  resourceStatuses: IDictionary<IResourceStatus>
  hasLoaded: boolean
  mapPixelWidth: number
  mapPixelHeight: number
  hasErrored: boolean
}
export const initialStateManager: IStateManager = {
  mapImageUrl: '',
  resources: {},
  resourceStatuses: {},
  hasLoaded: false,
  mapPixelWidth: 0,
  mapPixelHeight: 0,
  hasErrored: false,
}

export const useCmpManagerState = ({
  siteKey,
  areaKey,
  estateFloorKey,
  resourceTypes,
  futureStartTimestamp,
  futureEndTimestamp,
  fetchAreaStatusIntervalMs,
  neighbourhoodKeys,
  deskFeatureIds,
}: IProps): IStateManager => {
  const [stateManager, setStateManager] = useState(initialStateManager)
  const timestampRef = useRef<string | null>(null)
  const hasLoadedRef = useRef(false)

  // Reset state on estate change.
  useEffect(() => {
    hasLoadedRef.current = false
    setStateManager(initialStateManager)
  }, [areaKey, siteKey, estateFloorKey])

  const fetchStatuses = useCallback(
    async (replaceStatuses = false) => {
      const response = await api.viewAreaStatusRequest({
        siteKey,
        areaKey,
        estateFloorKey,
        timestamp: futureStartTimestamp || timestampRef.current,
        resourceTypes,
        timestampEnd: futureEndTimestamp,
        neighbourhoodKeys,
        deskFeatureIds,
      })

      if (replaceStatuses) {
        setStateManager((s) => ({
          ...s,
          resourceStatuses: response.data.changes,
        }))
        return
      }

      setStateManager((s) => ({
        ...s,
        resourceStatuses: {
          ...s.resourceStatuses,
          ...response.data.changes,
        },
      }))

      timestampRef.current = response.data.timestamp

      return
    },
    [
      areaKey,
      estateFloorKey,
      futureEndTimestamp,
      futureStartTimestamp,
      resourceTypes,
      siteKey,
      neighbourhoodKeys,
      deskFeatureIds,
    ]
  )

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return
    }

    const replaceStatuses = Boolean(futureStartTimestamp && futureEndTimestamp)

    void fetchStatuses(replaceStatuses)
  }, [futureStartTimestamp, futureEndTimestamp, neighbourhoodKeys, deskFeatureIds, fetchStatuses])

  useEffect(() => {
    if (!stateManager.hasLoaded) {
      return
    }

    if (futureStartTimestamp === null) {
      timestampRef.current = null
    }
  }, [futureStartTimestamp, stateManager.hasLoaded])

  useEffect(() => {
    if (!stateManager.hasLoaded || !fetchAreaStatusIntervalMs) {
      return
    }

    const interval = setInterval(() => {
      void fetchStatuses()
    }, fetchAreaStatusIntervalMs)

    return () => clearInterval(interval)
  }, [fetchAreaStatusIntervalMs, fetchStatuses, stateManager.hasLoaded])

  useEffect(() => {
    if (stateManager.hasLoaded) {
      return
    }

    const fetchAreaAndMap = async () => {
      timestampRef.current = null
      setStateManager((s) => ({ ...s, hasErrored: false, hasLoaded: false }))

      try {
        const {
          data: { resources, mapImageMapResourceKey },
        } = await api.viewAreaRequest({
          siteKey,
          areaKey,
          estateFloorKey,
          resourceTypes,
        })

        await fetchStatuses()

        const {
          data: { pixelBounds, filePath },
        } = await api.downloadMapResourceRequest({
          resourceKey: mapImageMapResourceKey,
        })

        const { mapPixelHeight, mapPixelWidth } = getMapInitialSize(pixelBounds)

        setStateManager((s) => ({
          ...s,
          hasLoaded: true,
          resources: svgParser(resources),
          mapImageUrl: filePath,
          mapPixelWidth,
          mapPixelHeight,
        }))
      } catch (e) {
        console.log(e)
        setStateManager((s) => ({ ...s, hasErrored: true }))
      } finally {
        hasLoadedRef.current = true
      }
    }
    void fetchAreaAndMap()
  }, [areaKey, estateFloorKey, siteKey, fetchStatuses, stateManager.hasLoaded, resourceTypes])

  return stateManager
}
