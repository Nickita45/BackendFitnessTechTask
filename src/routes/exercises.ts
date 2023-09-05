import { Router, Request, Response, NextFunction } from 'express'

import { Exercise, Program } from '../db'
import { EXERCISE_DIFFICULTY } from '../utils/enums'
import passport from '../utils/passport'

const router: Router = Router()

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const exercises = await Exercise.findAll({
			include: [{
				model: Program,
				as: 'program'
			}]
		})

		return res.json({
			data: exercises,
			message: 'List of exercises'
		})
	})
	router.post('', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: 'Access denied' });
		}

		const difficulty = _req.query.difficulty && Object.values(EXERCISE_DIFFICULTY).includes(_req.query.difficulty as EXERCISE_DIFFICULTY) ? _req.query.difficulty : EXERCISE_DIFFICULTY.EASY;

		const exercises = await Exercise.findAll();
		const exercisesIndex = exercises.length + 1;

		const newExercise = await Exercise.create(
			{
				difficulty: difficulty,
				name: _req.body.name || `Exercise ${exercisesIndex}`,
				programID: _req.body.program || 1
			});

		return res.json({
			data: newExercise,
			message: 'New Exercise'
		})
	})

	return router
}
