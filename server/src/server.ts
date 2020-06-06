import express from 'express'
import cors from 'cors'
import path from 'path'
import { errors } from 'celebrate'

import routes from './routes'

const app = express()

app.use(cors())
/**
 * Use está incluindo um plugin/funcionalidade, nesse caso express.json, para que 
 * o express possa entender o corpo da requisição no formato JSON.
 */
app.use(express.json())
app.use(routes)

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'tmp')))

app.use(errors)

app.listen(3333)