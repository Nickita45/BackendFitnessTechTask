/* eslint import/no-cycle: 0 */

import {
	Sequelize,
	DataTypes,
} from 'sequelize'
import { DatabaseModel } from '../types/db'
import { ProgramModel } from './program'

import { EXERCISE_DIFFICULTY } from '../utils/enums'
import { UserModel } from './user'
import { CompletedExercise } from './completedExercise'

export class ExerciseModel extends DatabaseModel {
	id: number
	difficulty: EXERCISE_DIFFICULTY
	name: String

	program: ProgramModel
	user: UserModel
	completedExercise: CompletedExercise[]
}

export default (sequelize: Sequelize) => {
	ExerciseModel.init({
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		difficulty: {
			type: DataTypes.ENUM(...Object.values(EXERCISE_DIFFICULTY))
		},
		name: {
			type: DataTypes.STRING(200),
		}
	}, {
		paranoid: true,
		timestamps: true,
		sequelize,
		modelName: 'exercise'
	})

	ExerciseModel.associate = (models) => {
		ExerciseModel.belongsTo(models.Program, {
			foreignKey: {
				name: 'programID', 
				allowNull: false,
			},
		});
		ExerciseModel.belongsTo(models.User, {
			foreignKey: {
				name: 'userID',
				allowNull: false,
			},
		});
		ExerciseModel.hasMany(models.CompletedExercise, {
			foreignKey: {
				name: 'exerciseID', 
				allowNull: false,
			},
			as: 'completedExercises',
		});
	};


	return ExerciseModel
}
