import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
  },
});

// Interceptor to include token in every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(
  (response) => response, // אם התשובה תקינה, מחזירים כרגיל
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token"); // מוחק את הטוקן הישן
      window.location.href = "/"; // מפנה את המשתמש לדף הבית
    }
    return Promise.reject(error); // מעביר את השגיאה להמשך טיפול
  });

 export const markMessageAsTask = async (messageId) => {
    try {
      const response = await apiClient.post(`/tasks/mark_as_task/${messageId}`)
      
      if (response.ok) {
        console.log("Message marked as task:");
      } else {
        console.error("Error marking message as task:")
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };
  
export const fetchSenderName = async (senderId, senderType) => {
  const response=await apiClient.get(`/messages/getSenderName/${senderId}/${senderType}`)
  return response.data
};
// Authentication APIs
export const registerEmployee = async (data) => {
  const response = await apiClient.post("/employees/register", data);
  return response.data;
};

export const loginEmployee = async (data) => {
  const response = await apiClient.post("/employees/login", data);
  return response.data;
};


// Client APIs
export const getClients = async () => {
  const response = await apiClient.get("/clients");
  return response.data;
};

export const getClientsByEmployee = async (employeeId) => {
  const response = await apiClient.get(`/clients/employee/${employeeId}`);
  return response.data;
};


// Message APIs
export const getMessagesByEmployee = async (employeeId) => {
  const response = await apiClient.get(`/messages/employee/${employeeId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await apiClient.post("/messages/", messageData);
  return response.data;
};

export const sendFileMessage = async (formData) => {
  const response = await apiClient.post("/messages/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const addFile = async (formData) => {
  const response = await apiClient.post("/messages/addFile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await apiClient.post("/clients", clientData);
  return response.data;
};

export const getEmployees = async () => {
  const response = await apiClient.get("/employees");
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await apiClient.post("/employees", employeeData);
  return response.data;
};

export const createMessage = async () => {
  const response = await apiClient.post("/messages");
  return response.data;
};


export const uploadFile = async () => {
  const response = await apiClient.post("/messages");
  return response.data;
};

export const deleteFile = async (fileId) => {
  try {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};



// Fetch all clients
export const fetchClients = async () => {
  const response = await apiClient.get("/clients/");
  return response.data;
};

// Add a new client
export const addClient = async (clientData) => {
  const response = await apiClient.post("/clients", clientData);
  return response.data;
};

// Update a client
export const updateClient = async (clientId, clientData) => {
  const response = await apiClient.put(`/clients/${clientId}`, clientData);
  return response.data;
};

export const getTasksByEmployee = async (employeeId) => {
  try {
    const response = await apiClient.get(`/tasks/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// API call to create a new task
export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// API call to update an existing task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const getFilesByClient = async (clientId) => {
  // Mock data
  const response= await apiClient.get(`files/${clientId}`)

  return response.data;
};
export const handleDownloadFiles = async (fileId, fileName) => {
  try {
    const response = await apiClient.get(`files/download/${fileId}`, {
      responseType: "blob", // חובה! הופך את התגובה לקובץ BLOB
    });

    // בדיקה נכונה לסטטוס התשובה
    if (response.status !== 200) {
      throw new Error("Failed to download file");
    }

    const blob = new Blob([response.data], { type: response.headers["content-type"] });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", fileName || "downloaded_file"); // אם חסר שם, ברירת מחדל
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // שחרור הכתובת מהזיכרון
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

export const updateMessage = async (messageId, newContent) => {
  try {
    // יצירת אובייקט FormData
    const formData = new FormData();
    formData.append("content", newContent);  // מוסיף את התוכן כ-FormData

    // שליחת הבקשה לשרת
    const response = await apiClient.put(`/messages/update/${messageId}`, formData);

    return response.data.updated_message;
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

export const getMessagesByEmployeeAndClient = async (employeeId, clientId) => {
  try {
    const response = await apiClient.get(`/messages/employee/${employeeId}/client/${clientId}`);
    return await response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};



