import express from 'express'
import cors from 'cors'

import getConfig from './config/config'
import user from './routes/user'
import question from './routes/question'
import answer from './routes/answer'
import organization from './routes/organization'
import notification from './routes/notification'

const port: number = parseInt(process.env.PORT!, 10) || 8080
const app = express()

app.listen(port, () => {
  console.log(`> Ready on ${getConfig().server.host}`)
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(cors(getConfig().cors.options)) // WhiteList는 더 알아보고 수정이 필요(지금 안 됨)
app.use(cors({credentials: true})) // 프론트엔드 테스트 용도

console.log('init middleware')

app.use('/user', user)
app.use('/organization', organization)
app.use('/question', question)
app.use('/answer', answer)
app.use('/notification', notification)

console.log('init router')

app.get('/', (_, res) => {
  res.send('Hello World! : ' + process.env.NODE_ENV)
})
