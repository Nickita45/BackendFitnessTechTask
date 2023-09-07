import { Router, Response, NextFunction } from 'express'

import { CompletedExercise, Exercise } from '../db'

import passport from '../utils/passport'

const router: Router = Router()

export default () => {
    /**
     * /completed/:id - GET, return all completed exercise by current user
     * 
     * return list of completed exercises
     */
    router.get('/', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {
        try {
            const completedExercises = await CompletedExercise.findAll({
                where: { userID: _req.user.id },
                include: [{ model: Exercise, attributes: ['name'], as: 'exercise' }],
                attributes: ['createdAt', 'durationTime', 'id'],
            });

            return res.json({
                data: completedExercises,
                message: res.locals.localization.completedList
            })
        } catch (error) {
            return res.status(500).json({ message: res.locals.localization.serverError });
        }
    })
    /**
     * /completed/:id - POST, add completed exercise to DB
     * parameters:
	 *  - exerciseId: id of exercise 
     *  - durationTime: int value in second
     * return completed exercise 
     */
    router.post('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response) => {
        const { exerciseId, durationTime } = _req.query;

        if (!exerciseId || !durationTime) {
            return res.status(400).json({ message: res.locals.localization.completedExerciseIdAndDuration });
        }

        try {
            const completedExercise = await CompletedExercise.create({
                userID: _req.user.id,
                exerciseID: exerciseId,
                durationTime: durationTime,
            });

            return res.json({
                data: completedExercise,
                message: res.locals.localization.completedCreated
            })
        } catch (error) {
            return res.status(500).json({ message: res.locals.localization.serverError });
        }
    });
     /**
     * /completed/:id - DELETE, remove completed exercise, user can delete only his completed exercise
     * parameters:
	 *  - id: id of completed exercise 
     * return deleted exercise 
     */
    router.delete('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response) => {
        const completedExerciseId = _req.params.id;

        try {
            // Check if the completed exercise belongs to the authenticated user
            const completedExercise = await CompletedExercise.findOne({
                where: { id: completedExerciseId, userID: _req.user.id },
            });

            if (!completedExercise) {
                return res.status(404).json({ message: res.locals.localization.completedNotFound });
            }

            await completedExercise.destroy();

            return res.json({
                data: completedExercise,
                message: res.locals.localization.completedDeleted
            })
        } catch (error) {
            return res.status(500).json({ message: res.locals.localization.serverError });
        }
    });

    return router
}
