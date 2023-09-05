/* eslint import/no-cycle: 0 */

import {
    Sequelize,
    DataTypes,
    Model
} from 'sequelize'
import { ROLE } from '../utils/enums'
import { DatabaseModel } from '../types/db'

export class UserModel extends DatabaseModel {
    // better make id using string
    id: number
    name: String
    surname: String
    nickName: String
    email: String
    age: number
    role: ROLE
    password: String
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

    return UserModel
}