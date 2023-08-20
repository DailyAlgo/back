import ejs from 'ejs'
import layout from './layout'

const template = ejs.compile(
  `
<div id="root"><%- content %></div>
`
)

function renderMain(content: string): string {
  const html = layout({
    title: 'Daily algo',
    body: template({ content }),
  })
  return html
}

export default renderMain
