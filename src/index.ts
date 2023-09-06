import http from 'http'
import express from 'express'
import * as bodyParser from 'body-parser'

import { sequelize } from './db'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'
import UserRouter from './routes/user'
import CompletedExercisesRouter from './routes/completedexercises'
import passport from 'passport'
import session from 'express-session'
import "./utils/passport"

const app = express();


app.use(
    session({
      secret: 'testket', // KEY SHOULD BE STORE IN ANOTHER PLACE
      resave: false,
      saveUninitialized: false,
    })
  );

app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())
app.use('/user', UserRouter())
app.use('/completed', CompletedExercisesRouter())

const httpServer = http.createServer(app)

sequelize.sync()

console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer
