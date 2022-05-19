import React, { FC, useCallback } from 'react'
import { MapDisplay, CmpManager, ResourceType } from 'map-web-core'
import { Loading } from './loading'
import styled from 'styled-components'
import './api/manager'
import { useDisplayState } from './map.state'
import { getTokenFromLocalStorage } from './api/get-token-examples'

// 104
const siteKey = undefined
const areaKey = undefined
const estateFloorKey = '1'

const resourceTypes: ResourceType[] = ['DESK', 'ROOM']
// const deskFeatureIds = ['14']
// const neighbourhoodKeys = ['1']

const Container = styled.div``

CmpManager.init({
  url: 'https://service.platformcluster.connectib.com/cmpmanager',
  getTokenCb: getTokenFromLocalStorage,
})

const App: FC = () => {
  const { state, selectResource, cancelResource, selectPoi, cancelPoi, onClickBackground, playRouteStage } =
    useDisplayState({
      siteKey,
      areaKey,
      estateFloorKey,
    })

  const button1 = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      playRouteStage({
        floorKey: '1',
        callouts: [
          {
            name: 'LUG.A1',
            resourceType: 'DESK',
            resourceKey: '59',
            iconMapResource: null,
            stepIndex: 0,
            x: 500,
            y: 204,
          },
        ],
        steps: [[500, 204]],
        text: 'Start at Desk LUG.A1',
      })
    },
    [playRouteStage]
  )

  const button2 = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      playRouteStage({
        floorKey: '1',
        callouts: [
          {
            name: 'LUG.A1',
            resourceType: 'DESK',
            resourceKey: '59',
            iconMapResource: null,
            stepIndex: 0,
            x: 500,
            y: 204,
          },
          {
            name: 'LUG.MR1',
            resourceType: 'ROOM',
            resourceKey: '6',
            iconMapResource: null,
            stepIndex: 13,
            x: 984,
            y: 770,
          },
        ],
        steps: [
          [500, 204],
          [462, 204],
          [462, 265],
          [462, 333],
          [579, 333],
          [744, 333],
          [744, 465],
          [767, 465],
          [767, 549],
          [868, 633],
          [1052, 633],
          [1052, 690],
          [1052, 770],
          [984, 770],
        ],
        text: 'Follow route as indicated',
      })
    },
    [playRouteStage]
  )

  const button3 = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      playRouteStage({
        floorKey: '1',
        callouts: [
          {
            name: 'LUG.MR1',
            resourceType: 'ROOM',
            resourceKey: '6',
            iconMapResource: null,
            stepIndex: 0,
            x: 984,
            y: 770,
          },
        ],
        steps: [[984, 770]],
        text: 'End at Meeting Room LUG.MR1',
      })
    },
    [playRouteStage]
  )

  return (
    <Container>
      <div style={{ position: 'absolute', zIndex: 100000, left: 0 }}>
        <button onClick={button1}>play 1</button>
        <button onClick={button2}>buttons</button>
        <button onClick={button3}>play 3</button>
      </div>
      <CmpManager
        resourceTypes={resourceTypes}
        onFloorChangeSuccessCallback={() => console.log('successful')}
        estateFloorKey={estateFloorKey}
      >
        {(stateManager, mapRendered) => (
          <MapDisplay
            onAnimationEndCallback={() => console.log('hello from end')}
            mapRendered={mapRendered}
            stateManager={stateManager}
            showResourcesByKey={state.showResourcesByKey}
            showResourceEventType="CLICK"
            youAreHere={state.youAreHere}
            interactions={state.interactions}
            pointsOfInterest={state.pointsOfInterest}
            LoadingComponent={Loading}
            selectedPointsOfInterest={state.selectedPointsOfInterest}
            selectResourceCallback={selectResource}
            cancelResourceCallback={cancelResource}
            onClickBackgroundCallback={onClickBackground}
            selectPoiCallback={selectPoi}
            cancelPoiCallback={cancelPoi}
            focusTo={state.focusTo}
            route={state.route}
            step={30}
          />
        )}
      </CmpManager>
    </Container>
  )
}

export default App
