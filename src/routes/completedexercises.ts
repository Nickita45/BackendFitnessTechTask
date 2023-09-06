import { Router, Response, NextFunction } from 'express'

import { CompletedExercise, Exercise } from '../db'

import passport from '../utils/passport'

const router: Router = Router()

export default () => {
    router.get('/', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {
        try {
            const completedExercises = await CompletedExercise.findAll({
                where: { userID: _req.user.id },
                include: [{ model: Exercise, attributes: ['name'], as: 'exercise' }],
                attributes: ['createdAt', 'durationTime', 'id'],
            });

            return res.json({
                data: completedExercises,
                message: 'List of completed exercises'
            })
        } catch (error) {
            return res.status(500).json({ message: 'Server error' });
        }
    })
    router.post('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response) => {
        const { exerciseId, durationTime } = _req.query;

        if (!exerciseId || !durationTime) {
            return res.status(400).json({ message: 'ExerciseId and durationInSeconds are required' });
        }

        try {
            const completedExercise = await CompletedExercise.create({
                userID: _req.user.id,
                exerciseID: exerciseId,
                durationTime: durationTime,
            });

            return res.json({
                data: completedExercise,
                message: 'Completed Exercise created'
            })
        } catch (error) {
            return res.status(500).json({ message: 'Server error' });
        }
    });
    router.delete('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response) => {
        const completedExerciseId = _req.params.id;

        try {
            // Check if the completed exercise belongs to the authenticated user
            const completedExercise = await CompletedExercise.findOne({
                where: { id: completedExerciseId, userID: _req.user.id },
            });

            if (!completedExercise) {
                return res.status(404).json({ message: 'Completed exercise not found' });
            }

            await completedExercise.destroy();

            return res.json({
                data: completedExercise,
                message: 'Completed exercise removed successfully'
            })
        } catch (error) {
            return res.status(500).json({ message: 'Server error' });
        }
    });

    return router
}
