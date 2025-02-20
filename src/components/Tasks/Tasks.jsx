import React, { useState, useEffect } from "react";
import { getTasksByEmployee, createTask, updateTask, deleteTask } from "../../api/api"; // Import the API calls
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem, Select, FormControl, InputLabel, Card, CardContent, CardActions, Typography, Grid, IconButton } from '@mui/material'; // Import MUI components
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import "./Tasks.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    client_id: "",
    employee_id: "",
    description: "",
    due_date: "",
    status: "pending",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const employeeId = localStorage.getItem("employee_id");

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await getTasksByEmployee(employeeId);
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [employeeId]);

  // Handle form field changes for new task
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handle creating a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const createdTask = await createTask(newTask);
      setTasks((prevTasks) => [...prevTasks, createdTask]);
      setNewTask({
        client_id: "",
        employee_id: "",
        description: "",
        due_date: "",
        status: "pending",
      });
      setIsCreateDialogOpen(false); // Close dialog after submission
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Handle editing a task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true); // Open the edit dialog
  };

  // Handle saving the edited task
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = await updateTask(editingTask.task_id, editingTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === updatedTask.task_id ? updatedTask : task
        )
      );
      setEditingTask(null);
      setIsEditDialogOpen(false); // Close dialog after saving changes
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle form field changes for editing task
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  return (
    <div>
         <Button  sx={{ position: "absolute" , bottom: "2vh",right: "43vw" ,backgroundColor: "#2d6a9c"}}variant="contained" onClick={() => setIsCreateDialogOpen(true)} style={{ marginBottom: '20px' }}>
        Create New Task
      </Button>
      <h1 className="task-title">Tasks</h1>

    

      {/* Task List */}
      <Grid sx={{marginLeft: "0"}} container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.task_id}>
            <Card >
              <CardContent>
                <Typography variant="h6">{task.description}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Due Date: {task.due_date}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton color="primary" onClick={() => handleEditTask(task)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDeleteTask(task.task_id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
          {/* Button to open Create Task Dialog */}
      
      </Grid>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Description"
            name="description"
            value={newTask.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Due Date"
            type="date"
            name="due_date"
            value={newTask.due_date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Client ID"
            name="client_id"
            value={newTask.client_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Employee ID"
            name="employee_id"
            value={newTask.employee_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={newTask.status}
              onChange={handleChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateTask} color="primary">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Description"
            name="description"
            value={editingTask?.description || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Due Date"
            type="date"
            name="due_date"
            value={editingTask?.due_date || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Client ID"
            name="client_id"
            value={editingTask?.client_id || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Employee ID"
            name="employee_id"
            value={editingTask?.employee_id || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={editingTask?.status || ""}
              onChange={handleEditChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
   
    </div>
  );
};

export default Tasks;
