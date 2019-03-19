import { h } from 'preact'
import { render } from 'preact-render-to-string'

import { App } from '../source/App'

const header = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Preact transform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
  <body><div id="root">`

const footer = `</div></body></html>`

const universalHandler = (req, res) => {
  res.write(header)

  const html = render(<App />)
  res.write(html)
  res.write(footer)

  res.end()
}

export { universalHandler }
