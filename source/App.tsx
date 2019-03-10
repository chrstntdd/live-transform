import { h } from 'preact'
import { useEffect, useRef, useReducer } from 'preact/hooks'

import './styles.css'

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

const transformerReducer = (state: State, action: Action): State => {
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
}

const App = () => {
  const [state, dispatch] = useReducer(transformerReducer, {
    byteCount: 0,
    inputValue: '',
    outputText: '',
    useTypeScript: false,
    minify: false
  })

  const terser = useRef(null)
  const ts = useRef(null)

  useEffect(() => {
    if (state.minify && !terser.current) {
      import(/* webpackChunkName: "terser" */ 'terser').then(module => {
        terser.current = module || module.default
      })
    }
  }, [state.minify])

  useEffect(() => {
    if (state.useTypeScript && !ts.current) {
      import(/* webpackChunkName: "typescript" */ 'typescript').then(module => {
        ts.current = module.transpileModule
      })
    }
  }, [state.useTypeScript])

  useEffect(() => {
    const output = state.inputValue
    let returnString = output

    if (state.useTypeScript && ts.current) {
      const { outputText } = ts.current(output, {
        compilerOptions: {
          jsx: 2, // React
          target: 6 // ESNEXT
        }
      })

      returnString = outputText
    }

    // MINIFY
    if (state.minify && terser.current) {
      const { code } = terser.current.minify(returnString)

      returnString = code
    }

    dispatch({ type: 'UPDATE_OUTPUT', value: returnString })
  }, [state.inputValue, state.minify])

  return (
    <div class="container">
      <InputArea dispatch={dispatch} />
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

const InputArea = ({ dispatch }) => {
  const textAreaRef = useRef(null)

  const handleChange = e => {
    if (textAreaRef.current.value) {
      const inputCode = textAreaRef.current.value

      dispatch({ type: 'CHANGE_INPUT', value: inputCode })
    }
  }

  return (
    <textarea
      ref={textAreaRef}
      style={{
        height: '80vh',
        width: '40%',
        resize: 'none'
      }}
      placeholder="put yer code here"
      onInput={handleChange}
    />
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
        <pre>
          <code>{processedOutput}</code>
        </pre>
      </div>
    </div>
  )
}

export { App }
