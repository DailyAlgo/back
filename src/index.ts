import express from 'express'

import user from './routes/user'
import article from './routes/article'

const port: number = parseInt(process.env.PORT!, 10) || 8080
const app = express()

app.listen(port, () => {
  console.log(`> Ready on http://localhost:8080`)
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

console.log('init middleware')

app.use('/user', user)
app.use('/article', article)

console.log('init router')

app.get('/', (_, res) => {
  res.send('Hello World!')
})
