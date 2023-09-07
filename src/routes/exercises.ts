import { Router, Request, Response, NextFunction } from 'express'

import { Exercise } from '../db'
import { EXERCISE_DIFFICULTY } from '../utils/enums'
import passport from '../utils/passport'
import { Op } from 'sequelize'

const router: Router = Router()

export default () => {
	/**
     * /exercises/ - GET, using different filters value for select from DB
     * parameters:
     *  - page: int value, index
     *  - limit: int value, limit of get value, max is 10
	 *  - programID: int value, program id 
	 *  - search: string, include in name value
     * return list of exercises
     */
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
			message: res.locals.localization.listExercises
		});
	})
	/**
     * /exercises/:id - POST, create a new exercises
     * parameters:
     *  - difficulty: can be only EASY, MEDIUM and HARD
     *  - name: string, name of exercises
	 *  - programID: int value, program id 
     * return new exercises if ADMIN
     */
	router.post('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: res.locals.localization.accessDenied });
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
			message: res.locals.localization.addedExercise
		})
	})
	/**
     * /exercises/:id - PUT, update exercises
     * parameters:
	 *  - id: id of exercise to update
     *  - difficulty: can be only EASY, MEDIUM and HARD
     *  - name: string, name of exercises
	 *  - programID: int value, program id 
     * return updated exercise if ADMIN
     */
	router.put('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: res.locals.localization.accessDenied });
		}

		if (!_req.query.id) {
			return res.status(401).json({ message: res.locals.localization.wrongId });
		}
		try {
			const exerciseToUpdate = await Exercise.findByPk(_req.query.id);

			if (!exerciseToUpdate) {
				return res.status(404).json({ message: res.locals.localization.exerciseNotFound });
			}


			exerciseToUpdate.name = _req.query.name || exerciseToUpdate.name;
			const difficulty = _req.query.difficulty && Object.values(EXERCISE_DIFFICULTY).includes(_req.query.difficulty as EXERCISE_DIFFICULTY) ? _req.query.difficulty : exerciseToUpdate.difficulty;
			exerciseToUpdate.difficulty = difficulty;
			exerciseToUpdate.programID = _req.query.programID || exerciseToUpdate.programID;
			exerciseToUpdate.userID = _req.user.id;

			await exerciseToUpdate.save();

			return res.json({
				data: exerciseToUpdate,
				message: res.locals.localization.exerciseUpdated
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: res.locals.localization.serverError });
		}
	})
	/**
     * /exercises/:id - DELETE, delete exercises
     * parameters:
	 *  - id: id of exercise to update
     * return deleted exercise if ADMIN
     */
	router.delete('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

		if (_req.user.role != "ADMIN") {
			return res.status(403).json({ message: res.locals.localization.accessDenied });
		}

		if (!_req.query.id) {
			return res.status(401).json({ message: res.locals.localization.wrongIdToRemove });
		}
		try {
			const exercise = await Exercise.findByPk(_req.query.id);

			if (!exercise) {
				return res.status(404).json({ message: res.locals.localization.exerciseNotFound });
			}

			await exercise.destroy();

			return res.json({
				data: exercise,
				message: res.locals.localization.exerciseDeleted
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: res.locals.localization.serverError });
		}
	})

	return router
}
