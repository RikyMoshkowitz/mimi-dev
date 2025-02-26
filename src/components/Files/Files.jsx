import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  Modal,
  Grid,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // Import AttachFileIcon
import { getClientsByEmployee, getFilesByClient, uploadFile, sendFileMessage, deleteFile, handleDownloadFiles, addFile } from "../../api/api";
import "./Files.css"; // Ensure the CSS file is correctly linked

const Files = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState({}); // Tracks new files by client_id
  const [selectedFile, setSelectedFile] = useState(null); // New state for file
  const [viewFile, setViewFile] = useState(null); // State to handle file preview
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
  const [fileToDelete, setFileToDelete] = useState(null); // State to hold file to delete
  const employeeId = localStorage.getItem("employee_id");

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClientsByEmployee(employeeId);
        setClients(data);

        // Initialize "new files" status for each client
        const initialNewFiles = data.reduce((acc, client) => {
          acc[client.client_id] = false; // Assume no new files initially
          return acc;
        }, {});
        setNewFiles(initialNewFiles);

        // Set the first client as selected by default
        if (data.length > 0) {
          handleClientClick(data[0]); // Select the first client
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, [employeeId]);

  // Fetch files for selected client
  const handleClientClick = async (client) => {
    setSelectedClient(client);
    try {
      const data = await getFilesByClient(client.client_id);

      // Normalize and filter files
      let normalizedFiles = [];
      if (Array.isArray(data)) {
        normalizedFiles = data;
      } else if (data && typeof data === "object") {
        normalizedFiles = [data];
      } else {
        console.error("Unexpected API response for files:", data);
        normalizedFiles = [];
      }

      setFiles(normalizedFiles);

      // Mark files as "seen" for this client
      setNewFiles((prevState) => ({
        ...prevState,
        [client.client_id]: false,
      }));
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  // Upload a new file
  const handleFileUpload = async (file) => {
    if (!selectedClient) {
      console.error("No client selected.");
      return;
    }

    try {
      if (file) {
        const formData = new FormData();

        formData.append("client_id", selectedClient.client_id);
        formData.append("employee_id", employeeId);
        formData.append("direction", "out");
        formData.append("status", "sent");
        formData.append("file", file);

        const response = await addFile(formData);
        setFiles([...files, response]); // Add the new file to the list
        setSelectedFile(null); // Clear the file selection
      }
    } catch (error) {
      console.error("Error uploading file:", error.response ? error.response.data : error);
    }
  };

  // Download a file
  const handleDownloadFile = (fileId, fileName) => {
    handleDownloadFiles(fileId, fileName)
  };

  // Send a file message
  const handleSendFileMessage = async (file) => {
    if (!selectedClient) {
      console.error("No client selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("client_id", selectedClient.client_id);
      formData.append("employee_id", employeeId);
      formData.append("file", file);

      const response = await sendFileMessage(formData);
      setFiles([...files, response]); // Add the new file message to the list
    } catch (error) {
      console.error("Error sending file message:", error.response ? error.response.data : error);
    }
  };

  // Open delete dialog
  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  // Confirm delete file
  const confirmDeleteFile = async () => {
    try {
      await deleteFile(fileToDelete.file_id);
      setFiles(files.filter((file) => file.file_id !== fileToDelete.file_id)); // Remove the file from the list
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Error deleting file:", error.response ? error.response.data : error);
    }
  };

  // Cancel delete file
  const cancelDeleteFile = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  // Check for new files periodically
  useEffect(() => {
    const checkNewFiles = async () => {
      try {
        const data = await getFilesByClient(selectedClient.client_id);

        // Normalize files
        const normalizedFiles = Array.isArray(data) ? data : [data];
        const newFilesStatus = {};

        // Check for new files for this client
        const hasNew = normalizedFiles.some(
          (file) => file.client_id === selectedClient.client_id && file.status === "new"
        );
        newFilesStatus[selectedClient.client_id] = hasNew;

        setNewFiles(newFilesStatus);
      } catch (error) {
        console.error("Error checking new files:", error);
      }
    };

    // Poll for new files every 10 seconds if a client is selected
    const interval = selectedClient ? setInterval(checkNewFiles, 10000) : null;
    return () => clearInterval(interval);
  }, [selectedClient, employeeId]);

  // Function to handle file preview
  const handleViewFile = (file) => {
    setViewFile(file);
  };

  // Function to handle closing the preview modal
  const handleClosePreview = () => {
    setViewFile(null);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Client List */}
      <Box
        sx={{
          width: "30%",
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          sx={{ padding: "10px", color: "#2d6a9c" }}
        >
          Clients
        </Typography>
        <List>
          {clients.map((client) => (
            <ListItem
              key={client.client_id}
              onClick={() => handleClientClick(client)}
              className={
                selectedClient?.client_id === client.client_id
                  ? "client-item selected"
                  : "client-item"
              }
              sx={{
                cursor: "pointer",
                padding: "10px",
                backgroundColor: selectedClient?.client_id === client.client_id ? "#0078D4" : "transparent",
                
              }}
            >
              <ListItemAvatar>
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!newFiles[client.client_id]} // Show badge only if new file exists
                >
                  <Avatar>{client.name.charAt(0)}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={client.name}
                primaryTypographyProps={{
                  fontWeight: newFiles[client.client_id] ? "bold" : "normal",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Files */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <Box sx={{ padding: "10px", display: "flex", alignItems: "center" }}>
          <input
            type="file"
            id="fileInput"
            onChange={(event) => {
              const file = event.target.files[0]; // קבלת הקובץ שנבחר
              if (file) {
                setSelectedFile(file); // שמירת הקובץ בסטייט
                handleFileUpload(file); // קריאה לפונקציה להעלאת הקובץ
              }
            }}            style={{ display: "none" }}
          />
          <Button
            sx={{backgroundColor: "#2d6a9c" , position: "absolute" , bottom: "4vh" , right: "30vw", zIndex:"1000"}}
            variant="contained"
            color="primary"
            onClick={() => document.getElementById("fileInput").click()} // Trigger file input on button click
          >
            <AttachFileIcon />
            Add New File
          </Button>
        </Box>

        <List sx={{ flex: 1, overflowY: "auto" }}>
          {files.map((file) => (
            <ListItem key={file.file_id} sx={{ display: "flex", justifyContent: "space-between" }}>
              <ListItemText primary={file.file_name} secondary={`Uploaded on: ${new Date(file.uploaded_at).toLocaleString()}`} />

              <Box>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleDownloadFile(file.file_id, file.file_name)}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => handleSendFileMessage(file)}
                >
                  <SendIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteFile(file)}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="info"
                  onClick={() => handleViewFile(file)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* File Preview Modal */}
      <Modal open={viewFile !== null} onClose={handleClosePreview}>
        <Box sx={{ padding: "20px", backgroundColor: "#fff", margin: "10% auto", maxWidth: "500px", borderRadius: "8px", boxShadow: 3 }}>
          {viewFile && (
     
            
            <>
                 
              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                {viewFile.file_name}

              </Typography>
          
          
              <iframe src={`http://localhost:8000/thumbnails/${(viewFile.file_name)}.png`} width="100%" height="400px" />
            </>

          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteFile}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the file "{fileToDelete?.file_name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteFile}>Cancel</Button>
          <Button onClick={confirmDeleteFile} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Files;
