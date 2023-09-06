/* eslint import/no-cycle: 0 */

import {
    Sequelize,
    DataTypes,
} from 'sequelize'
import { DatabaseModel } from '../types/db'
import { ExerciseModel } from './exercise'
import { UserModel } from './user'

export class CompletedExercise extends DatabaseModel {

    id: number
    durationTime: number  //in seconds

    exercise: ExerciseModel
    user: UserModel
}

export default (sequelize: Sequelize) => {
    CompletedExercise.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        durationTime: {
            type: DataTypes.INTEGER,
        },
    }, {
        paranoid: true,
        timestamps: true,
        sequelize,
        modelName: 'CompletedExercise',
        tableName: 'completedexcercise'
    })
    CompletedExercise.associate = (models) => {
        CompletedExercise.belongsTo(models.User, {
            foreignKey: {
                name: 'userID',
                allowNull: false,
            },
        });
        CompletedExercise.belongsTo(models.Exercise, {
            foreignKey: {
                name: 'exerciseID', 
                allowNull: false,
            },
        });
    };
    return CompletedExercise
}