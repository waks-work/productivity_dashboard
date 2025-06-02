import { fetchAPI } from "./api";

export const get_task = async () => {
    return fetchAPI('/tasks/');
}

export const createTasks =  (taskData) => {
    return fetchAPI('/tasks/', 'POST', taskData)
}

export const updateTasks = (id, updates) => {
    return  fetchAPI(`/tasks/ ${id}/`, 'PATCH', updates)
}
