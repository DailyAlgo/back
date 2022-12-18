import express from 'express'

const port: number = parseInt(process.env.PORT!, 10) || 8080
const app = express()

app.listen(port, () => {
  console.log('the application is listening on port 8080')
})

console.log('init middleware')

console.log('init router')
