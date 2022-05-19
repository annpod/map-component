import { useState, useCallback, useMemo } from 'react'
import { IResource, ShowResourceEventType } from '../../typings/typings'

export const useManageResourceCallouts = (
  showResourceEventType: ShowResourceEventType,
  showResourcesByKey: string[],
  resources: Record<string, IResource>
) => {
  const [onHoverShowResourceByKey, setOnHoverShowResourceByKey] = useState<string[]>([])

  const onResourceMouseEnter = useCallback((resource: IResource) => {
    const { resourceKey, resourceType } = resource
    const key = `${resourceType}_${resourceKey}`
    setOnHoverShowResourceByKey([key])
  }, [])

  const onResourceMouseLeave = useCallback(() => setOnHoverShowResourceByKey([]), [])

  const listOfResourcesToShow = useMemo(() => {
    return (
      {
        CLICK: showResourcesByKey,
        ALL: Object.keys(resources),
        HOVER: onHoverShowResourceByKey,
      }[showResourceEventType] || []
    )
  }, [onHoverShowResourceByKey, resources, showResourceEventType, showResourcesByKey])

  return {
    listOfResourcesToShow,
    onResourceMouseEnter,
    onResourceMouseLeave,
  }
}
