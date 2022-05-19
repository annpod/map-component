import React, { FC } from 'react'
import { IStateManager } from './useManagerState'
import { api, GetTokenCb } from './apiController'
import { useCmpManagerState } from './useManagerState'
import { IMapRendered, useMapRendered } from '../hooks/has-map-rendered'
import { ResourceType } from '../typings/typings'

interface IProps {
  siteKey?: string
  areaKey?: string
  estateFloorKey?: string
  resourceTypes?: ResourceType[]
  children: (props: IStateManager, mapRendered: IMapRendered) => React.ReactElement<HTMLDivElement>
  futureStartTimestamp?: string | null
  futureEndTimestamp?: string | null
  fetchAreaStatusIntervalMs?: number
  neighbourhoodKeys?: string[]
  deskFeatureIds?: string[]
  onFloorChangeSuccessCallback?: () => void
}

type CmpManagerStaticTypes = { init: (param: { url: string; getTokenCb: GetTokenCb }) => void }

export const CmpManager: FC<IProps> & CmpManagerStaticTypes = ({
  siteKey,
  areaKey,
  estateFloorKey,
  children,
  resourceTypes,
  futureEndTimestamp,
  futureStartTimestamp,
  fetchAreaStatusIntervalMs,
  neighbourhoodKeys,
  deskFeatureIds,
  onFloorChangeSuccessCallback,
}) => {
  const mapRendered: IMapRendered = useMapRendered({ siteKey, areaKey, estateFloorKey, onFloorChangeSuccessCallback })
  const stateManager: IStateManager = useCmpManagerState({
    siteKey,
    areaKey,
    estateFloorKey,
    resourceTypes,
    futureEndTimestamp,
    futureStartTimestamp,
    fetchAreaStatusIntervalMs,
    neighbourhoodKeys,
    deskFeatureIds,
  })

  return children(stateManager, mapRendered)
}

CmpManager.init = api.init.bind(api)
