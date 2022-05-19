import { useEffect, useState } from 'react'

interface IProps {
  siteKey?: string
  areaKey?: string
  estateFloorKey?: string
  onFloorChangeSuccessCallback?: () => void
}

export interface IMapRendered {
  hasMapRendered: boolean
  setHasMapRendered: (b: boolean) => void
}

export const useMapRendered = ({
  siteKey,
  areaKey,
  estateFloorKey,
  onFloorChangeSuccessCallback,
}: IProps): IMapRendered => {
  const [hasMapRendered, setHasMapRenderedUpdate] = useState(false)

  useEffect(() => {
    setHasMapRenderedUpdate(false)
  }, [siteKey, areaKey, estateFloorKey])

  const setHasMapRendered = (hasRendered: boolean) => {
    setHasMapRenderedUpdate(hasRendered)
    if (hasRendered && onFloorChangeSuccessCallback) {
      onFloorChangeSuccessCallback()
    }
  }

  return { hasMapRendered, setHasMapRendered }
}
