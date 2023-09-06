/* eslint import/no-cycle: 0 */

import {
    Sequelize,
    DataTypes,
} from 'sequelize'
import { ROLE } from '../utils/enums'
import { DatabaseModel } from '../types/db'
import { ExerciseModel } from './exercise'
import { CompletedExercise } from './completedExercise'

export class UserModel extends DatabaseModel {
    // better make id using string UUID
    id: number
    name: String
    surname: String
    nickName: String
    email: String
    age: number
    role: ROLE
    password: String

    exercises: ExerciseModel[]
    completedExercise: CompletedExercise[]
}

export default (sequelize: Sequelize) => {
    UserModel.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(200),
        },
        surname: {
            type: DataTypes.STRING(200),
        },
        nickName: {
            type: DataTypes.STRING(200),
            unique: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        age: {
            type: DataTypes.INTEGER,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(ROLE)),
            defaultValue: ROLE.USER,
        },
        password: {
            type: DataTypes.STRING,
        }
    }, {
        paranoid: true,
        timestamps: true,
        sequelize,
        modelName: 'User',
        tableName: 'users'
    })
    UserModel.associate = (models) => {
        UserModel.hasMany(models.Exercise, {
            foreignKey: {
                name: 'userID',
                allowNull: false,
            },
            as: 'translations',
        });
        UserModel.hasMany(models.CompletedExercise, {
            foreignKey: {
                name: 'userID',
                allowNull: false,
            },
            as: 'completedExercises',
        });
    };
    return UserModel
}