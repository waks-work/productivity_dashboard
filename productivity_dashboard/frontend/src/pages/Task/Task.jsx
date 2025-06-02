import React from 'react'
import './Task.css'
import Complete from '../../components/Complete/Complete'
import Headers from '../../components/Headers/Headers'
import TaskNavBar from '../../components/TaskNavBar/TaskNavBar'
import TaskList from '../../components/TaskList/TaskList'
import Limit from '../../components/Limit/Limit'
import Progress from '../../components/Progress/Progress'
import Journal from '../../components/Journal/Journal'

const Task = () => {
    return (
        <div>
            <Headers/>
            <TaskNavBar/>
            <Limit/>
            <TaskList/>
            <Progress/>
            <Complete/>
            <Journal/>
        </div>
    )
    }

export default Task
