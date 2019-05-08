import { h, Component } from 'preact'
import { useEffect, useRef, useReducer, useCallback } from 'preact/hooks'

import { CodeBlock } from './CodeBlock'
import { CodeEditor, textContent } from './CodeEditor'

if (typeof window !== 'undefined') {
  require('./styles.css')
}

/**
 * @description To measure a string in bytes
 */
function measure(input: string) {
  return new Blob([input]).size
}

type Action =
  | { type: 'CHANGE_INPUT'; value: string }
  | { type: 'UPDATE_OUTPUT'; value: string }
  | { type: 'USE_TYPE_SCRIPT'; checked: boolean }
  | { type: 'USE_TERSER'; checked: boolean }
  | { type: 'LOADED_TERSER'; payload: typeof import('terser').minify }
  | { type: 'LOADED_TYPESCRIPT'; payload: typeof import('typescript').transpileModule }

type State = {
  byteCount: number
  inputValue: string
  outputText: string
  useTypeScript: boolean
  typeScriptModule: undefined | typeof import('typescript').transpileModule
  minifyOutput: boolean
  terserModule: undefined | typeof import('terser').minify
}

const appReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CHANGE_INPUT':
      return {
        ...state,
        inputValue: action.value
      }

    case 'UPDATE_OUTPUT':
      return {
        ...state,
        outputText: action.value,
        byteCount: measure(action.value)
      }

    case 'USE_TYPE_SCRIPT':
      return {
        ...state,
        useTypeScript: action.checked
      }

    case 'USE_TERSER':
      return {
        ...state,
        minifyOutput: action.checked
      }

    case 'LOADED_TERSER':
      return {
        ...state,
        minifyOutput: true,
        terserModule: action.payload
      }

    case 'LOADED_TYPESCRIPT':
      return {
        ...state,
        useTypeScript: true,
        typeScriptModule: action.payload
      }

    default:
      return state
  }
}

const init = () => ({
  byteCount: 0,
  inputValue: textContent,
  outputText: textContent,
  useTypeScript: false,
  typeScriptModule: void 0,
  minifyOutput: false,
  terserModule: void 0
})

const App = () => {
  const [state, dispatch] = useReducer(appReducer, void 0, init)

  useEffect(() => {
    if (state.minifyOutput && !state.terserModule) {
      import(/* webpackChunkName: "terser" */ 'terser').then(module => {
        dispatch({ type: 'LOADED_TERSER', payload: module.minify })
      })
    }

    if (state.useTypeScript && !state.typeScriptModule) {
      import(/* webpackChunkName: "typescript" */ 'typescript').then(module => {
        dispatch({ type: 'LOADED_TYPESCRIPT', payload: module.transpileModule })
      })
    }

    // NAIVE APPROACH - minifiying the output without converting the source to pure JS causes terser to error
    let current = state.inputValue

    if (state.useTypeScript && state.typeScriptModule) {
      const { outputText } = state.typeScriptModule(state.inputValue, {
        compilerOptions: {
          jsx: 2, // React
          target: 6 // ESNEXT
        }
      })

      current = outputText
    }

    if (state.minifyOutput && state.terserModule) {
      const { code, error } = state.terserModule(state.outputText)

      if (error) {
        throw error
      }

      current = code
    }

    dispatch({ type: 'UPDATE_OUTPUT', value: current })
  })

  return (
    <div class="container">
      <CodeEditor dispatch={dispatch} />
      <div>
        <OutputArea
          dispatch={dispatch}
          byteCount={state.byteCount}
          processedOutput={state.outputText}
          useTypeScript={state.useTypeScript}
          minifyOutput={state.minifyOutput}
        />
      </div>
    </div>
  )
}

const TypeScriptToggle = ({ dispatch }) => {
  return (
    <label for="use-ts">
      <input
        type="checkbox"
        id="use-ts"
        onChange={event => {
          dispatch({ type: 'USE_TYPE_SCRIPT', checked: event.srcElement.checked })
        }}
      />
      Use TypeScript
    </label>
  )
}

const TerserToggle = ({ dispatch }) => {
  return (
    <label for="minify">
      <input
        type="checkbox"
        id="minify"
        onChange={event => {
          dispatch({ type: 'USE_TERSER', checked: event.srcElement.checked })
        }}
      />
      Minify
    </label>
  )
}

const OutputArea = ({ dispatch, processedOutput, byteCount, useTypeScript, minifyOutput }) => {
  return (
    <div class="output-area">
      <div class="transformation-container">
        <TypeScriptToggle dispatch={dispatch} />
        <TerserToggle dispatch={dispatch} />
        <div>bytes: {byteCount}</div>
      </div>

      <div class="output-text">
        <CodeBlock minifyOutput={minifyOutput} dispatch={dispatch}>
          <code>{processedOutput}</code>
        </CodeBlock>
      </div>
    </div>
  )
}

export { App }
