import { memo, useState, useEffect, useRef } from 'react'
import { useSpring } from 'react-spring'
import { getPathToBeDrawn } from './route.utlis'
import { IRoute } from '../../typings/typings'
import { VIEW_BOX } from '../../constants'
import { PathDotted, PathStatic, Svg, SvgWrapper, PathSpring, PathSingleStep } from './route.styled'

interface IRouteProps {
  route: IRoute
  onAnimationStartCallback?: () => void
  onAnimationEndCallback?: () => void
}
interface IPathAnimatedProps extends IRouteProps {
  pathToBeDrawn: string
}

const PathAnimated = ({
  route,
  pathToBeDrawn,
  onAnimationStartCallback,
  onAnimationEndCallback,
}: IPathAnimatedProps) => {
  const pathRef: React.RefObject<SVGGeometryElement> = useRef(null)
  const [pathLength, setPathLength] = useState<number>(0)
  const { status, velocity } = route

  useEffect(() => {
    if (!pathRef.current) return
    const length = pathRef.current.getTotalLength()
    setPathLength(length)
  }, [])

  const animationDuration = pathLength * velocity
  const animatedStyle = useSpring({
    from: { x: 0 },
    x: 1,
    config: { duration: animationDuration, delay: 200 },
    onRest: () => onAnimationEndCallback && onAnimationEndCallback(),
    onStart: () => onAnimationStartCallback && onAnimationStartCallback(),
  })

  return (
    <>
      <defs>
        <mask id="theMask" maskUnits="userSpaceOnUse">
          <PathSpring
            ref={pathRef}
            id="maskPath"
            stroke="#fff"
            d={pathToBeDrawn}
            strokeDasharray={pathLength}
            strokeDashoffset={animatedStyle.x.to((x: number) => (1 - x) * pathLength)}
          />
        </mask>
      </defs>
      <g id="maskReveal" mask="url(#theMask)">
        <PathSpring
          d={pathToBeDrawn}
          strokeDasharray={pathLength}
          strokeDashoffset={animatedStyle.x.to((x: number) => (1 - x) * pathLength)}
        />
        <PathDotted
          d={pathToBeDrawn}
          animationDuration={animationDuration}
          pathLength={pathLength}
          routeStatus={status}
        />
      </g>
    </>
  )
}

const RouteC = ({ route, onAnimationStartCallback, onAnimationEndCallback }: IRouteProps) => {
  const { steps, isAnimated } = route

  const pathToBeDrawn = getPathToBeDrawn(steps)

  if (!steps.length) return null

  if (steps.length === 1) {
    return (
      <Svg viewBox={VIEW_BOX}>
        <PathSingleStep
          onAnimationStart={onAnimationStartCallback && onAnimationStartCallback}
          onAnimationEnd={onAnimationEndCallback && onAnimationEndCallback}
        />
      </Svg>
    )
  }

  return (
    <SvgWrapper>
      <Svg viewBox={VIEW_BOX}>
        {isAnimated ? (
          <PathAnimated
            route={route}
            pathToBeDrawn={pathToBeDrawn}
            onAnimationStartCallback={onAnimationStartCallback}
            onAnimationEndCallback={onAnimationEndCallback}
          />
        ) : (
          <PathStatic d={pathToBeDrawn} />
        )}
      </Svg>
    </SvgWrapper>
  )
}

export const Route = memo(RouteC)
