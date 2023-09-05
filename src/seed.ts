import { models, sequelize } from './db/index'
import { EXERCISE_DIFFICULTY } from './utils/enums'
import crypto from 'crypto'

const {
	Exercise,
	Program,
	User
} = models

const seedDB = async () => {
	await sequelize.sync({ force: true })

	await Program.bulkCreate([{
		name: 'Program 1'
	}, {
		name: 'Program 2'
	}, {
		name: 'Program 3'
	}] as any[], { returning: true })

	await Exercise.bulkCreate([{
		name: 'Exercise 1',
		difficulty: EXERCISE_DIFFICULTY.EASY,
		programID: 1
	}, {
		name: 'Exercise 2',
		difficulty: EXERCISE_DIFFICULTY.EASY,
		programID: 2
	}, {
		name: 'Exercise 3',
		difficulty: EXERCISE_DIFFICULTY.MEDIUM,
		programID: 1
	}, {
		name: 'Exercise 4',
		difficulty: EXERCISE_DIFFICULTY.MEDIUM,
		programID: 2
	}, {
		name: 'Exercise 5',
		difficulty: EXERCISE_DIFFICULTY.HARD,
		programID: 1
	}, {
		name: 'Exercise 6',
		difficulty: EXERCISE_DIFFICULTY.HARD,
		programID: 2
	}])
	await User.bulkCreate(usersData);
}

seedDB().then(() => {
	console.log('DB seed done')
	process.exit(0)
}).catch((err) => {
	console.error('error in seed, check your data and model \n \n', err)
	process.exit(1)
})

const usersData = [
	{
	  name: 'John',
	  surname: 'Doe',
	  nickName: 'johndoe',
	  email: 'john@example.com',
	  age: 30,
	  role: 'USER',
	  password: crypto.createHash('md5').update("fdfdfd").digest('hex'),
	},
	{
	  name: 'Alice',
	  surname: 'Smith',
	  nickName: 'alicesmith',
	  email: 'alice@example.com',
	  age: 25,
	  role: 'USER',
	  password: crypto.createHash('md5').update("1234").digest('hex'),
	},
	{
	  name: 'Bob',
	  surname: 'Johnson',
	  nickName: 'bobjohnson',
	  email: 'bob@example.com',
	  age: 35,
	  role: 'ADMIN',
	  password: crypto.createHash('md5').update("dsdsdsd").digest('hex'),
	},
	{
	  name: 'Eva',
	  surname: 'Brown',
	  nickName: 'evabrown',
	  email: 'eva@example.com',
	  age: 28,
	  role: 'USER',
	  password: crypto.createHash('md5').update("sadsadads").digest('hex'),
	},
  ];