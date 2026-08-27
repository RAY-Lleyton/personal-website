/// <reference types="vite/client" />

declare module '*.csv?raw' {
  const content: string
  export default content
}

declare module '*.glb' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module 'meshline' {
  export const MeshLineGeometry: any
  export const MeshLineMaterial: any
}
