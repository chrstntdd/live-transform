import { h } from 'preact'
import { useEffect, useRef, useReducer } from 'preact/hooks'

import { CodeBlock } from './CodeBlock'
import { CodeEditor } from './CodeEditor'

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

type State = {
  byteCount: number
  inputValue: string
  outputText: string
  useTypeScript: boolean
  minify: boolean
}

const useTS = (useTypeScript: boolean, inputText: string): string => {
  const ts = useRef(null)

  useEffect(() => {
    if (useTypeScript && !ts.current) {
      /**
       * @see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#transpiling-a-single-file
       */
      import(/* webpackChunkName: "typescript" */ 'typescript').then(module => {
        ts.current = module.transpileModule
      })
    }
  }, [useTypeScript])

  if (ts.current && useTypeScript) {
    const { outputText } = ts.current(inputText, {
      compilerOptions: {
        jsx: 2, // React
        target: 6 // ESNEXT
      }
    })
    return outputText
  }

  return inputText
}

const App = () => {
  const [state, dispatch] = useReducer(
    function transformerReducer(state: State, action: Action): State {
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
            minify: action.checked
          }

        default:
          return state
      }
    },
    {
      byteCount: 0,
      inputValue: '',
      outputText: '',
      useTypeScript: false,
      minify: false
    }
  )

  const terser = useRef(null)

  useEffect(() => {
    if (state.minify && !terser.current) {
      import(/* webpackChunkName: "terser" */ 'terser').then(module => {
        terser.current = module || module.default
      })
    }
  }, [state.minify])

  useEffect(() => {
    const fromTypeScriptCompiler = useTS(state.useTypeScript, state.inputValue)
    let returnString = fromTypeScriptCompiler

    // MINIFY
    if (state.minify && terser.current) {
      const { code } = terser.current.minify(returnString)

      returnString = code
    } else if (!state.minify) {
      returnString = fromTypeScriptCompiler
    }

    dispatch({ type: 'UPDATE_OUTPUT', value: returnString })
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
          minify={state.minify}
        />
      </div>
    </div>
  )
}

const TypeScriptToggle = ({ dispatch, useTypeScript }) => {
  const handleChange = event => {
    dispatch({ type: 'USE_TYPE_SCRIPT', checked: event.srcElement.checked })
  }
  return (
    <label for="use-ts">
      <input type="checkbox" id="use-ts" onChange={handleChange} checked={useTypeScript} />
      Use TypeScript
    </label>
  )
}

const TerserToggle = ({ minify, dispatch }) => {
  const handleChange = event => {
    dispatch({ type: 'USE_TERSER', checked: event.srcElement.checked })
  }
  return (
    <label for="minify">
      <input type="checkbox" id="minify" onChange={handleChange} checked={minify} />
      Minify
    </label>
  )
}

const OutputArea = ({ dispatch, processedOutput, byteCount, useTypeScript, minify }) => {
  return (
    <div class="output-area">
      <div class="transformation-container">
        <TypeScriptToggle dispatch={dispatch} useTypeScript={useTypeScript} />
        <TerserToggle dispatch={dispatch} minify={minify} />
      </div>

      <div>bytes: {byteCount}</div>
      <div class="output-text">
        <CodeBlock isMinified={minify}>
          <code>{processedOutput}</code>
        </CodeBlock>
      </div>
    </div>
  )
}

export { App }
