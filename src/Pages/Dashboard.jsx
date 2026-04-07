import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Alert, CircularProgress,
    Tabs, Tab, Chip, IconButton, LinearProgress
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Dashboard.css';

const Dashboard = () => {
    const [tab, setTab] = useState(0);
    const [task, setTask] = useState('');
    const [taskArray, setTaskArray] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [status, setStatus] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => { getTask(); }, []);

    const getTask = async () => {
        setFetchLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/tasks/gettask', authHeader);
            setTaskArray(res.data || []);
        } catch (err) {
            setError('Failed to fetch tasks. Check if server is running.');
        } finally {
            setFetchLoading(false);
        }
    }

    const postTask = async () => {
        if (!task.trim()) { setError('Please enter a task'); setTimeout(() => setError(''), 3000); return; }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/tasks/addtask', { task: task.trim() }, authHeader);
            setTask('');
            setStatus(true);
            getTask();
            setTimeout(() => setStatus(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add task');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/tasks/updatetask/${id}`, { status: newStatus }, authHeader);
            getTask();
        } catch (err) {
            setError('Failed to update task');
        }
    }

    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/tasks/deletetask/${id}`, authHeader);
            getTask();
        } catch (err) {
            setError('Failed to delete task');
        }
    }

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    }

    const completed = taskArray.filter(t => t.status === 'completed').length;
    const inProgress = taskArray.filter(t => t.status === 'in progress').length;
    const notCompleted = taskArray.filter(t => t.status === 'not completed').length;
    const progress = taskArray.length ? Math.round((completed / taskArray.length) * 100) : 0;

    const statusColor = { 'completed': 'success', 'in progress': 'warning', 'not completed': 'error' };
    const nextStatus = { 'not completed': 'in progress', 'in progress': 'completed', 'completed': 'not completed' };

    return (
        <div className='dashboard'>
            {status && <div className='alert-fixed'><Alert icon={<CheckIcon />} severity="success">Task added!</Alert></div>}
            {error && <div className='alert-fixed'><Alert icon={<ErrorIcon />} severity="error" action={<Button size="small" onClick={getTask}>Retry</Button>}>{error}</Alert></div>}

            <div className='dashboard-header'>
                <Typography variant="h5">Task Manager</Typography>
                <Button variant="outlined" color="error" onClick={logout}>Logout</Button>
            </div>

            <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
                <Tab label="Tasks" />
                <Tab label="Profile" />
            </Tabs>

            {tab === 0 && (
                <div className='tab-content'>
                    <Box className='progress-box'>
                        <Typography variant="body2">Overall Progress: {progress}%</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, height: 10, borderRadius: 5 }} />
                        <Box className='stats'>
                            <Chip label={`Not Completed: ${notCompleted}`} color="error" size="small" />
                            <Chip label={`In Progress: ${inProgress}`} color="warning" size="small" />
                            <Chip label={`Completed: ${completed}`} color="success" size="small" />
                        </Box>
                    </Box>

                    <Box className='add-task-box'>
                        <TextField fullWidth label="Add Task" value={task} onChange={(e) => setTask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && postTask()} />
                        <Button variant="contained" onClick={postTask} disabled={loading || !task.trim()} sx={{ ml: 1 }}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Add'}
                        </Button>
                    </Box>

                    {fetchLoading ? (
                        <div className='center'><CircularProgress /><Typography>Loading tasks...</Typography></div>
                    ) : taskArray.length === 0 ? (
                        <div className='center'><Typography color="textSecondary">No tasks found. Add your first task!</Typography></div>
                    ) : (
                        <ul className='task-list'>
                            {taskArray.map((res) => (
                                <li key={res._id} className='task-item'>
                                    <Typography sx={{ flex: 1, textDecoration: res.status === 'completed' ? 'line-through' : 'none' }}>
                                        {res.task}
                                    </Typography>
                                    <Chip
                                        label={res.status}
                                        color={statusColor[res.status]}
                                        size="small"
                                        onClick={() => updateStatus(res._id, nextStatus[res.status])}
                                        sx={{ cursor: 'pointer', mx: 1 }}
                                    />
                                    <IconButton color="error" size="small" onClick={() => deleteTask(res._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {tab === 1 && (
                <div className='tab-content'>
                    <Box className='profile-box'>
                        <div className='avatar'>{user?.name?.charAt(0).toUpperCase()}</div>
                        <Typography variant="h5">{user?.name}</Typography>
                        <Typography color="textSecondary">{user?.email}</Typography>
                        <Box className='profile-stats'>
                            <Box className='stat-card'><Typography variant="h4">{taskArray.length}</Typography><Typography>Total</Typography></Box>
                            <Box className='stat-card'><Typography variant="h4" color="success.main">{completed}</Typography><Typography>Completed</Typography></Box>
                            <Box className='stat-card'><Typography variant="h4" color="warning.main">{inProgress}</Typography><Typography>In Progress</Typography></Box>
                            <Box className='stat-card'><Typography variant="h4" color="error.main">{notCompleted}</Typography><Typography>Not Completed</Typography></Box>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 10, borderRadius: 5, width: '100%' }} />
                        <Typography sx={{ mt: 1 }}>Completion Rate: {progress}%</Typography>
                    </Box>
                </div>
            )}
        </div>
    )
}

export default Dashboard;
