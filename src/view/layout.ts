import ejs from 'ejs'

const template = ejs.compile(
  `
<!DOCTYPE html>
<html lang="ko">
  <head>
    <title><%= title %></title>
  </head>
<body>
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
