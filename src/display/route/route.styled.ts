import styled, { keyframes } from 'styled-components'
import { animated } from 'react-spring'

export const PathStatic = styled.path`
  fill: none;
  stroke: ${(props) => props.theme.route.color};
  stroke-width: ${(props) => props.theme.route.width};
`
export const PathDotted = styled.path<{
  pathLength: number
  animationDuration: number
  routeStatus: string
}>`
  fill: none;
  stroke-dasharray: ${(props) => props.theme.route.dashWidth};
  stroke: ${(props) => props.theme.route.dashColor};
  stroke-width: ${(props) => props.theme.route.width};
  animation-name: ${(props) => animatePathForward(props.pathLength)};
  animation-duration: ${(props) => 3 * props.animationDuration}ms;
  animation-timing-function: linear;
  animation-delay: 0s;
  animation-iteration-count: ${(props) => props.theme.route.animationIterationCount};
  animation-direction: normal;
  animation-play-state: ${(props) => props.routeStatus};
  animation-fill-mode: forwards;
`
export const PathSpring = styled(animated.path)<{
  stroke?: string
}>`
  fill: none;
  stroke: ${(props) => props.stroke || props.theme.route.color};
  stroke-width: ${(props) => props.theme.route.width};
`

export const SvgWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`
export const Svg = styled.svg`
  position: absolute;
  fill-rule: evenodd;
  clip-rule: evenodd;
  stroke-miterlimit: 1.5;
  width: 100%;
  height: 100%;
`

const animatePathForward = (pathLength: number) => keyframes`
  to {
      stroke-dashoffset: 0;
  }
  from {
      stroke-dashoffset: ${pathLength};
  }
`

export const PathSingleStep = styled.path`
  fill: none;
  animation-name: ${() => animatePathForward(0)};
  animation-duration: 1ms;
`
