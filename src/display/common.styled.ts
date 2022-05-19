import styled from 'styled-components'

export const OverlaySvg = styled.svg`
  pointer-events: none;
  width: inherit;
  height: inherit;

  > path {
    pointer-events: auto;
  }
`

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: inherit;
  img {
    width: inherit;
    height: inherit;
    user-select: none;
    pointer-events: none;
    position: flex;
    justify-content: center;
    align-items: center;
  }
`

export const OverlayContainer = styled.div`
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  top: 0px;
  width: inherit;
  height: inherit;
`

export const Layer = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  pointer-events: none;
  left: 0px;
  top: 0px;
`

export const DebugC = styled.div`
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 100000;
`

export const FullWidthContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`

export const MainContainer = styled.div`
  width: inherit;
  height: inherit;
  position: relative;
`
