import styled from 'styled-components'

export const Label = styled.div<{
  x: number
  y: number
  ratio: number
  centerOfLabel: number
}>`
  left: ${(props) => `${props.x / props.ratio}px`};
  top: ${(props) => `${props.y / props.ratio}px`};
  z-index: 100;
  position: absolute;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  font-weight: 600;
  line-height: 1.42857143;
  font-size: 16px;
  margin-top: -${(props) => props.centerOfLabel}px;
  max-width: 90vw;
  border: none;
  cursor: pointer;
  pointer-events: none;
`

export const Arrow = styled.div`
  position: relative;
  width: 0;
  height: 0;
  border-color: transparent;
  border-right-color: transparent;
  border-style: solid;
  left: 50%;
  margin-left: -11px;
  border-width: 11px 11px 0;
  border-top-color: ${(props) => props.color};
`

export const Text = styled.div`
  color: #fff;
  text-align: center;
  background-color: ${(props) => props.color};
  padding: 6px 12px;
  border-radius: 8px;
  box-sizing: border-box;
`

export const IconContainer = styled.div`
  border-radius: 5px;
  border: 1px solid black;
  background: #ffffff;
  padding: 2px;
  width: 34px;
  height: 34px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
`

export const Icon = styled.img`
  width: 100%;
  height: 100%;
  display: block;
`
