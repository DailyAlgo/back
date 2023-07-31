export type Config = {
  db: {
    connectionLimit: number
    host: string
    port: number
    database: string
    user: string
    password: string
  }
}
const getConfig = (): Config => ({
  db: {
    connectionLimit: 5,
    host: 'localhost',
    port: 3306,
    database: 'daily_algo',
    user: 'test',
    password: '1234',
  },
})

export default getConfig
