import React from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';  
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import "./css/TaskManager.css"
import axios from 'axios';
import { useState, useEffect } from 'react';

const TaskManager = () => {
  const[task,setTask]=useState('');
  const [status,setStatus] =useState(false);
  const [error,setError] =useState('');
  const [loading,setLoading] =useState(false);
  const [fetchLoading,setFetchLoading] =useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTask, setEditingTask] = useState('');

  const[taskArray,setTaskArray]=useState([]);
  // create post
  const postTask=async()=>{
    if(!task.trim()) {
      setError('Please enter a task');
      setTimeout(()=>setError(''),3000);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post("http://localhost:5000/tasks/addtask",{task: task.trim()});
      setTask('');
      setStatus(true);
      getTask();
      setTimeout(()=>setStatus(false),3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add task. Server may be down.');
      setTimeout(()=>setError(''),5000);
    } finally {
      setLoading(false);
    }
  }
  // read get
  const getTask =async()=>{
    setFetchLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/tasks/gettask');
      setTaskArray(response.data || []);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setError('Server is not running. Start your backend server on port 5000.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch tasks.');
      }
      setTaskArray([]);
    } finally {
      setFetchLoading(false);
    }
  }

  // Update task
  const updateTask = async (id, updatedTask) => {
    if (!updatedTask.trim()) {
      setError('Task cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await axios.put(`http://localhost:5000/tasks/updatetask/${id}`, { task: updatedTask.trim() });
      setEditingId(null);
      setEditingTask('');
      getTask();
      setStatus(true);
      setTimeout(() => setStatus(false), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/deletetask/${id}`);
      getTask();
      setStatus(true);
      setTimeout(() => setStatus(false), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete task');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Start editing
  const startEdit = (id, currentTask) => {
    setEditingId(id);
    setEditingTask(currentTask);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTask('');
  };

  // Load tasks on component mount
  useEffect(() => {
    getTask();
  }, []);
  return (
    <div className='tasklist'>
        <Typography variant="h1" gutterBottom>Task Manager</Typography>
        <Box sx={{ width: 500, maxWidth: '100%' }} className='box'>
          <TextField fullWidth label="Add Task" id="fullWidth" value={task} onChange={(e)=>setTask(e.target.value)} />
          <Button 
            variant="contained" 
            color="button" 
            className='button' 
            onClick={postTask}
            disabled={loading || !task.trim()}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Add'}
          </Button>
       </Box>
       {/* Success Alert */}
       {
        status && (
            <div style={{
                position:"fixed",
                top:"20px",
                right:"20px",
                zIndex:"9999",
                }}>
                <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
                  Task has been Posted
                </Alert>
            </div>
        )
       }
       
       {/* Error Alert */}
       {
        error && (
            <div style={{
                position:"fixed",
                top:"20px",
                right:"20px",
                zIndex:"9999",
                }}>
                <Alert 
                  icon={<ErrorIcon fontSize="inherit" />} 
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={getTask}>
                      Retry
                    </Button>
                  }
                >
                  {error}
                </Alert>
            </div>
        )
       }
       <div>
         {fetchLoading ? (
           <div style={{textAlign: 'center', marginTop: '20px'}}>
             <CircularProgress />
             <Typography>Loading tasks...</Typography>
           </div>
         ) : taskArray.length === 0 && !error ? (
           <div style={{textAlign: 'center', marginTop: '20px'}}>
             <Typography variant="h6" color="textSecondary">
               No tasks found. Add your first task above!
             </Typography>
           </div>
         ) : error ? (
           <div style={{textAlign: 'center', marginTop: '20px'}}>
             <Typography variant="h6" color="error">
               Unable to load tasks
             </Typography>
             <Button variant="outlined" onClick={getTask} style={{marginTop: '10px'}}>
               Try Again
             </Button>
           </div>
         ) : (
           <ul style={{ listStyle: 'none', padding: 0 }}>
             {taskArray.map((res) => (
               <li key={res._id} style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'space-between',
                 padding: '10px',
                 margin: '5px 0',
                 border: '1px solid #ddd',
                 borderRadius: '5px',
                 backgroundColor: '#f9f9f9'
               }}>
                 {editingId === res._id ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                     <TextField
                       value={editingTask}
                       onChange={(e) => setEditingTask(e.target.value)}
                       size="small"
                       style={{ flex: 1 }}
                     />
                     <IconButton
                       color="primary"
                       size="small"
                       onClick={() => updateTask(res._id, editingTask)}
                     >
                       <SaveIcon />
                     </IconButton>
                     <IconButton
                       color="secondary"
                       size="small"
                       onClick={cancelEdit}
                     >
                       <CancelIcon />
                     </IconButton>
                   </div>
                 ) : (
                   <>
                     <h4 style={{ margin: 0, flex: 1 }}>{res.task}</h4>
                     <div style={{ display: 'flex', gap: '10px' }}>
                       <IconButton
                         color="primary"
                         size="small"
                         onClick={() => startEdit(res._id, res.task)}
                       >
                         <EditIcon />
                       </IconButton>
                       <IconButton
                         color="error"
                         size="small"
                         onClick={() => deleteTask(res._id)}
                       >
                         <DeleteIcon />
                       </IconButton>
                     </div>
                   </>
                 )}
               </li>
             ))}
           </ul>
         )}
       </div>
    </div> 
  )
}

export default TaskManager