import ejs from 'ejs'

const template = ejs.compile(
  `
<!DOCTYPE html>
<html lang="ko">
  <head>
    <title><%= title %></title>
  </head>
<body>
  <p style="color: blue;">hello it's p</p>
  <%- body %>
</body>
</html>`
)

interface Props {
  title: string
  body: string
}

const layout = ({ title, body }: Props): string => {
  return template({
    title,
    body,
  })
}

export default layout
