import { DefaultTheme } from 'styled-components'

export const theme: DefaultTheme = {
  route: {
    color: 'rgba(255,0,0,1)',
    width: '10px',
    dashColor: 'rgba(255,255,255,0.3)',
    dashWidth: 12,
    animationIterationCount: 'infinite',
  },
  label: {
    font: {
      family: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      wight: 600,
      size: '16px',
      maxWidth: '90vw',
      lineHeight: 1.42857143,
      color: '#ffffff',
    },
  },
  backgroundColor: '#f5f6f6',
  statusColors: {
    normal: {
      ALC: '#E0D6D7',
      AVL: '#3DA359',
      AWA: '#FEBA3D',
      BKD: '#FEBA3D',
      CLN: '#DBDBDB',
      OCC: '#A62F43',
      RSV: '#E0D6D7',
      RST: '#DBDBDB',
      UNV: '#DBDBDB',
    },
    impaired: {
      ALC: '#E0D6D7',
      AVL: '#00be00',
      AWA: '#FEBA3D',
      BKD: '#FEBA3D',
      CLN: '#DBDBDB',
      OCC: '#ff0000',
      RSV: '#E0D6D7',
      RST: '#DBDBDB',
      UNV: '#DBDBDB',
    },
  },
}
