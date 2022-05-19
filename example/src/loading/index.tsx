import { FC } from 'react'
import styled from 'styled-components'

const brandPrimary = '#F93549'

const Loader = styled.div`
  &.loader,
  &.loader:before,
  &.loader:after {
    background: ${brandPrimary};
    -webkit-animation: load1 1s infinite ease-in-out;
    animation: load1 1s infinite ease-in-out;
    width: 1em;
    height: 4em;
  }
  &.loader {
    color: ${brandPrimary};
    text-indent: -9999em;
    margin: 88px auto;
    position: relative;
    font-size: 9px;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }
  &.loader:before,
  &.loader:after {
    position: absolute;
    top: 0;
    content: '';
  }
  &.loader:before {
    left: -1.5em;
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }
  &.loader:after {
    left: 1.5em;
  }
  @-webkit-keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
  @keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
`

export const Loading: FC = () => <Loader className="loader" />
