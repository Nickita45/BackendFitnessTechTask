import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'

import { Exercise, Program } from '../db'
import passport from '../utils/passport'

const router: Router = Router()

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: 'List of programs'
		})
	})
	router.put('/edit-exercieses', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {
		// programId, exerciesId 
		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: 'Access denied' });
		}
		try {
			const { programId, exercisesToAdd } = _req.query;

			const program = await Program.findByPk(programId);

			const exercise = await Exercise.findByPk(exercisesToAdd);


			if (!program) {
				return res.status(401).json({ message: 'Program not found' });
			}
			if (!exercise) {
				return res.status(401).json({ message: 'Exercise not found' });
			}
			
			const exerciesesNameIsUsed = await Exercise.findOne({
				where: {
					programID: programId,
					name: exercise.name 
				}
			});

			if (exerciesesNameIsUsed) {
				return res.status(401).json({ message: 'Exercise name is already used in the program' });
			}

			const newExercise = await Exercise.create(
				{
					name: exercise.name,
					difficulty: exercise.difficulty,
					programID: program.id,
					userID: _req.user.id
				});


			return res.json({
				data: newExercise,
				message: 'New exercise added'
			})
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error' });
		}
	})

	router.delete('/edit-exercieses', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {
		// programId, exerciesId 
		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: 'Access denied' });
		}
		try {
			const { programId, exercisesToRem } = _req.query;

			const program = await Program.findByPk(programId);

			const exercise = await Exercise.findByPk(exercisesToRem);


			if (!program) {
				return res.status(401).json({ message: 'Program not found' });
			}
			if (!exercise) {
				return res.status(401).json({ message: 'Exercise not found' });
			}
			
			const exerciesesNameIsUsed = await Exercise.findOne({
				where: {
					programID: programId,
					name: exercise.name 
				}
			});

			if (!exerciesesNameIsUsed) {
				return res.status(401).json({ message: 'Exercise name is not used in this exercise' });
			}

			await exercise.destroy();

			return res.json({
				data: exerciesesNameIsUsed,
				message: 'Exercies was removed'
			})
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error' });
		}
	})
	return router
}
