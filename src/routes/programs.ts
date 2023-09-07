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
	/**
     * /programs/
     * return information about programs 
     */
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: res.locals.localization.programList
		})
	})
	/**
     * /programs/edit-eexercieses - PUT, add exercise to program list  
     * parameters:
     *  - programId: program id
     *  - exercisesToAdd: exercise id 
     * return exercise added to program if ADMIN
     */
	router.put('/edit-exercieses', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {
		// programId, exerciesId 
		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: res.locals.localization.accessDenied });
		}
		try {
			const { programId, exercisesToAdd } = _req.query;

			const program = await Program.findByPk(programId);

			const exercise = await Exercise.findByPk(exercisesToAdd);


			if (!program) {
				return res.status(401).json({ message: res.locals.localization.programNotFound });
			}
			if (!exercise) {
				return res.status(401).json({ message: res.locals.localization.exerciseNotFound });
			}
			
			const exerciesesNameIsUsed = await Exercise.findOne({
				where: {
					programID: programId,
					name: exercise.name 
				}
			});

			if (exerciesesNameIsUsed) {
				return res.status(401).json({ message: res.locals.localization.programExcerciseUsed });
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
				message: res.locals.localization.addedExercise
			})
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: res.locals.localization.serverError });
		}
	})
	/**
     * /programs/edit-eexercieses - DELETE, remove exercise from program list
     * parameters:
     *  - programId: program id
     *  - exercisesToRem: exercise id 
     * return exercise removed from program if ADMIN
     */
	router.delete('/edit-exercieses', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {
		// programId, exerciesId 
		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: res.locals.localization.accessDenied });
		}
		try {
			const { programId, exercisesToRem } = _req.query;

			const program = await Program.findByPk(programId);

			const exercise = await Exercise.findByPk(exercisesToRem);


			if (!program) {
				return res.status(401).json({ message: res.locals.localization.programNotFound });
			}
			if (!exercise) {
				return res.status(401).json({ message: res.locals.localization.exerciseNotFound });
			}
			
			const exerciesesNameIsUsed = await Exercise.findOne({
				where: {
					programID: programId,
					name: exercise.name 
				}
			});

			if (!exerciesesNameIsUsed) {
				return res.status(401).json({ message: res.locals.localization.programExcerciseNotUsed });
			}

			await exercise.destroy();

			return res.json({
				data: exerciesesNameIsUsed,
				message: res.locals.localization.exerciseDeleted
			})
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: res.locals.localization.serverError });
		}
	})
	return router
}
