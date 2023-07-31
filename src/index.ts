import express from 'express'

import user from './routes/user'

const port: number = parseInt(process.env.PORT!, 10) || 8080
const app = express()

app.listen(port, () => {
  console.log(`> Ready on http://localhost:8080`)
})

console.log('init middleware')

app.use('/user', user)

console.log('init router')

app.get('/', (_, res) => {
  res.send('Hello World!')
})
