import { Router, Request, Response, NextFunction } from 'express'

import { Exercise } from '../db'
import { EXERCISE_DIFFICULTY } from '../utils/enums'
import passport from '../utils/passport'
import { Op } from 'sequelize'

const router: Router = Router()

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const { page, limit, programID, search } : any = _req.query;

		// empty object
		const where: any = {};

		const parsedPage = parseInt(page, 10) || 1;
		const parsedLimit = parseInt(limit, 10) || 10;

		if (programID) {
			where.programID = programID;
		}

		// sql like system
		if (search) {
			where.name = { [Op.iLike]: `%${search}%` }; 
		}

		// calculate the offset based on page and limit
		const offset = (parsedPage - 1) * parsedLimit;

		const exercises = await Exercise.findAll({
			where,
			limit: parsedLimit,
			offset,
		});
		// maximum value
		const totalExercises = await Exercise.count({ where });

		res.json({
			exercises,
			currentPage: parsedPage,
			totalPages: Math.ceil(totalExercises / parsedLimit),
			message: 'List of exercises'
		});
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
				name: _req.query.name || `Exercise ${exercisesIndex}`,
				programID: _req.query.programID || 1,
				userID: _req.user.id
			});

		return res.json({
			data: newExercise,
			message: 'New Exercise'
		})
	})
	router.put('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: 'Access denied' });
		}

		if (!_req.query.id) {
			return res.status(401).json({ message: 'Enter id to change' });
		}
		try {
			const exerciseToUpdate = await Exercise.findByPk(_req.query.id);

			if (!exerciseToUpdate) {
				return res.status(404).json({ message: 'Exercise not found' });
			}


			exerciseToUpdate.name = _req.query.name || exerciseToUpdate.name;
			const difficulty = _req.query.difficulty && Object.values(EXERCISE_DIFFICULTY).includes(_req.query.difficulty as EXERCISE_DIFFICULTY) ? _req.query.difficulty : exerciseToUpdate.difficulty;
			exerciseToUpdate.difficulty = difficulty;
			exerciseToUpdate.programID = _req.query.programID || exerciseToUpdate.programID;
			exerciseToUpdate.userID = _req.user.id;

			await exerciseToUpdate.save();

			return res.json({
				data: exerciseToUpdate,
				message: 'Exercise updated successfully'
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error' });
		}
	})
	router.delete('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: 'Access denied' });
		}

		if (!_req.query.id) {
			return res.status(401).json({ message: 'Enter id to remove' });
		}
		try {
			const exercise = await Exercise.findByPk(_req.query.id);

			if (!exercise) {
				return res.status(404).json({ message: 'Exercise not found' });
			}

			await exercise.destroy();

			return res.json({
				data: exercise,
				message: 'Exercise deleted successfully'
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error' });
		}
	})

	return router
}
