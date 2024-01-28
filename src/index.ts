import express from 'express'
import cors from 'cors'

import getConfig from './config/config'
import user from './routes/user'
import question from './routes/question'
import answer from './routes/answer'
import organization from './routes/organization'
import notification from './routes/notification'

import logErrors from './middleware/logErrors'
import clientErrorHandler from './middleware/clientErrorHandler'
import errorHandler from './middleware/errorHandler'

const port: number = parseInt(process.env.PORT!, 10) || 8080
const app = express()

app.listen(port, () => {
  console.log(`> Ready on ${getConfig().server.host}`)
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(cors(getConfig().cors.options)) // WhiteList는 더 알아보고 수정이 필요(지금 안 됨)
app.use(cors({origin: ['http://localhost:3000',
'http://dailyalgo.kr',
'http://dailyalgo.co.kr',
'http://www.dailyalgo.kr',
'http://www.dailyalgo.co.kr',
'https://dailyalgo.kr',
'https://dailyalgo.co.kr',
'https://www.dailyalgo.kr',
'https://www.dailyalgo.co.kr',
], credentials: true}))

console.log('init middleware')

app.use('/user', user)
app.use('/organization', organization)
app.use('/question', question)
app.use('/answer', answer)
app.use('/notification', notification)

console.log('init router')

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

app.get('/', (_, res) => {
  res.send('Hello World! : ' + process.env.NODE_ENV)
})
