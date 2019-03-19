import { h } from 'preact'
import { useRef, useEffect } from 'preact/hooks'

import { useModule } from './hooks'

const CodeEditor = ({ dispatch }) => {
  const cmRef = useRef(null)
  const textAreaRef = useRef(null)
  const codeMirrorModule = useModule(
    async () =>
      await import(/* webpackChunkName: "codemirror" */ 'codemirror').then(module => module.default)
  )

  useEffect(() => {
    if (textAreaRef.current && codeMirrorModule) {
      const cm = codeMirrorModule.fromTextArea(textAreaRef.current, {
        // value: String(this.props.value || ''),
        value: textContent,
        mode: 'tsx',
        theme: 'one-dark',
        lineNumbers: true,
        indentWithTabs: false,
        tabSize: 2,
        showCursorWhenSelecting: true,
        extraKeys: {
          'Cmd-/': 'toggleComment'
        }
      })
      dispatch({ type: 'CHANGE_INPUT', value: textContent })

      cm.on('change', () => {
        const val = cm.getValue()

        dispatch({ type: 'CHANGE_INPUT', value: val })
      })

      cmRef.current = cm
    }

    return () => {
      cmRef.current = null
    }
  }, [codeMirrorModule])

  return <textarea ref={textAreaRef} autocomplete="off" defaultValue={textContent} />
}

const textContent = `import React from 'react'

import { nextUuid } from './helpers'

const AccordionContext = React.createContext({
  setExpanded: (uuid: number, expanded: boolean) => {},
  state: -1
})

const Accordion: React.FC = ({ children }) => {
  const [state, setState] = React.useState(-1)
  const setExpanded = (uuid: number, expanded: boolean) => {
    if (expanded) {
      setState(uuid)
    } else {
      setState(-1)
    }
  }

  const value = {
    setExpanded,
    state
  }

  return (
    <AccordionContext.Provider value={value}>
      <div className="accordion" role="tablist">
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface FoldProps {
  handleToggle?: (event: React.SyntheticEvent) => void
  label: string
  id: string
  sectionId: string
}

/**
 * @description
 * An accordion item
 */
const Fold: React.FC<FoldProps> = ({ label, id, sectionId, children }) => {
  const { setExpanded, state } = React.useContext(AccordionContext)

  const uuid = React.useRef(null)

  React.useEffect(() => {
    uuid.current = nextUuid()
  }, [])

  const handleToggle = () => {
    setExpanded(uuid.current, state !== uuid.current)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleToggle()
    }
  }

  return (
    <>
      <div
        className="fold"
        role="tab"
        tabIndex={0}
        id={id}
        aria-controls={sectionId}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        // aria-selected={} TODO
      >
        {label}
      </div>
      <div
        tabIndex={0}
        role="tabpanel"
        id={sectionId}
        aria-labelledby={id}
        aria-hidden={state !== uuid.current}
      >
        {children}
      </div>
    </>
  )
}

export { Accordion, Fold }`

export { CodeEditor }
