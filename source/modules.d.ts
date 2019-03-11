// force a module
export {}

declare global {
  interface Image extends HTMLImageElement {}
  interface NodeModule {
    /* for hot reloading during development */
    hot: boolean
  }
}
