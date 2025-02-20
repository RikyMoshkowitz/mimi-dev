import React, { useState, useEffect, useRef } from "react";
import { borderRight, styled, width } from "@mui/system";

import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  InputAdornment
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import {
  getClientsByEmployee,
  getMessagesByEmployee,
  sendMessage,
  sendFileMessage,
  updateMessage,
  fetchSenderName,
} from "../../api/api";
import "./Messages.css";
import MessageItem from "../MessageItem/MessageItem";
import mammoth from "mammoth";
import { image } from "framer-motion/client";
import { BsFillFileWordFill, BsFillFilePdfFill, BsFillFileExcelFill } from "react-icons/bs";
import { FaFileImage, FaFileAlt, FaFileVideo } from "react-icons/fa";
import { AiFillFileWord } from "react-icons/ai";
import { PiMicrosoftPowerpointLogoFill } from "react-icons/pi";


const Messages = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [newMessages, setNewMessages] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageSender, setMessageSender] = useState("");  
  const [replyToMessageId, setReplyToMessageId] = useState("");  
  const messagesEndRef = useRef(null); // יצירת ref לאלמנט ההודעות
  const [filePreview, setFilePreview] = useState(null); // משתנה לאחסון התצוגה המקדימה

  const employeeId = localStorage.getItem("employee_id");
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  
    if (file) {
        const formData = new FormData();
        formData.append("file", file);
        console.log("📤 נשלח קובץ:", file.name);

        try {
            const response = await fetch("http://localhost:8000/messages/file-thumbnail", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json(); // קבלת JSON ולא blob
                console.log("✅ URL של תמונה ממוזערת:", data.thumbnail_url);
                setFilePreview(data.thumbnail_url); // שמירת ה-URL
            } else {
                const errorText = await response.text();
                console.error("🚨 שגיאה ביצירת תמונה ממוזערת:", errorText);
            }
        } catch (error) {
            console.error("🚨 שגיאה בשליחת קובץ:", error);
        }
    }
};

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // לאחר טעינת ההודעות או בכל פעם שהן משתנות
    scrollToBottom();
  }, [messages]);
  const handleSaveEdit = async () => {
    if (!editingMessageId || !editedMessage.trim()) return;

    try {
      const updatedMessage = await updateMessage(editingMessageId, editedMessage);

      if (updatedMessage) {
        setMessages(messages.map((m) =>
          m.message_id === editingMessageId ? { ...m, content: updatedMessage.content } : m
        ));
      }
    } catch (error) {
      console.error("Failed to update message:", error);
    }

    setEditingMessageId(null);
  };


  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (msg) => {
    console.log("מחיקת הודעה:", msg);
    setMessages(messages.filter((m) => m.message_id !== msg.message_id));
  };
  const handleEditClick = (msg) => {
    setEditingMessageId(msg.message_id);
    setEditedMessage(msg.content);
  };
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClientsByEmployee(employeeId);
        setClients(data);

        const initialNewMessages = data.reduce((acc, client) => {
          acc[client.client_id] = false;
          return acc;
        }, {});
        setNewMessages(initialNewMessages);

        if (!selectedClient && data.length > 0) {
          handleClientClick(data[0]);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, [employeeId, selectedClient]);

  const handleClientClick = async (client) => {
    setSelectedClient(client);
    try {
      const data = await getMessagesByEmployee(employeeId);
      const normalizedMessages = Array.isArray(data) ? data : [data];
      const clientMessages = normalizedMessages.filter(
        (msg) => msg.client_id === client.client_id
      );

      setMessages(clientMessages);
      setNewMessages((prevState) => ({
        ...prevState,
        [client.client_id]: false,
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    const checkNewMessages = async () => {
      try {
        const data = await getMessagesByEmployee(employeeId);
        const normalizedMessages = Array.isArray(data) ? data : [data];
        const newMessagesStatus = {};

        clients.forEach((client) => {
          const hasNew = normalizedMessages.some(
            (msg) => msg.client_id === client.client_id && msg.status === "new"
          );
          newMessagesStatus[client.client_id] = hasNew;
        });

        setNewMessages(newMessagesStatus);
      } catch (error) {
        console.error("Error checking new messages:", error);
      }
    };

    const interval = setInterval(checkNewMessages, 10000);
    return () => clearInterval(interval);
  }, [clients, employeeId]);

  const handleSendMessage = async () => {
    if (!selectedClient) {
      console.error("No client selected.");
      return;
    }

    try {
      if (newMessage.trim()) {
        const messageData = {
          client_id: selectedClient.client_id,
          employee_id: employeeId,
          direction: "out",
          content: newMessage.trim(),
          status: "sent",
          parent_message_id: replyToMessageId ? replyToMessageId: null
                };

        const response = await sendMessage(messageData);
        setMessages([...messages, response]);
        setNewMessage("");
      }

      if (selectedFile) {
        const formData = new FormData();
        formData.append("client_id", selectedClient.client_id);
        formData.append("employee_id", employeeId);
        formData.append("direction", "out");
        formData.append("status", "sent");
        formData.append("file", selectedFile);

        const response = await sendFileMessage(formData);
        setMessages([...messages, response]);
        setSelectedFile(null);
        setFilePreview(null);        
      }
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response ? error.response.data : error
      );
    }
  };
  const handleReply = async (msg) => {
    const senderId = msg.status === "received" ? msg.client_id : msg.employee_id;
    const senderType = msg.status === "received" ? "client" : "employee";
    setReplyToMessageId(msg.message_id)
    try {
      // קריאה לשרת לקבלת פרטי השולח
      const senderName = await fetchSenderName(senderId , senderType);
      
      const sender_name = `${senderName}: `;  // ציטוט ההודעה הקודמת עם שם השולח
      const msg_content=`${msg.content}\n\n`
      setMessageContent(msg_content); // מצרף את תוכן ההודעה הקודמת לשדה ההודעה
      setMessageSender(senderName)
    } catch (error) {
      console.error("Error fetching sender name:", error);
    }
  };
  const StyledButton = styled(Button)({
    backgroundColor: "#4287c0"/* 50% שקיפות */,
    padding: "4px",
    height: "5vh",
    borderRadius: "0px",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px"
  });
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ["jpg", "jpeg", "png", "gif"];
    const ext = fileName.split(".").pop().toLowerCase();
    return imageExtensions.includes(ext);
  };
  
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt size={24} color="gray" />; // ברירת מחדל - אייקון קובץ כללי
    const ext = fileName.split(".").pop().toLowerCase();
  
    switch (ext) {
      case "docx":
      case "doc":
        return <AiFillFileWord size={24} width=  "40px" color="rgb(69, 129, 221)" />;
      case "pdf":
        return <BsFillFilePdfFill size={24} color="red" />;
      case "xlsx":
      case "xls":
         return <BsFillFileExcelFill size={24} color="green" />;      case "xlsx":
      case "pptx":
        return <PiMicrosoftPowerpointLogoFill size={24} color="#D24726" />;
        case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FaFileImage size={24} color="purple" />;
      case "mp4":
      case "avi":
      case "mov":
        return <FaFileVideo size={24} color="darkblue" />;
      default:
        return <FaFileAlt size={24} color="gray" />;
    }
  };
  return (
    <Box className="messages-container">
      <Box className="clients-list">
        <Typography sx={{ color: "#2d6a9c" }} variant="h4" className="clients-title">Clients</Typography>
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
            >
              <ListItemAvatar>
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!newMessages[client.client_id]}
                >
                  <Avatar>{client.name.charAt(0)}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={client.name}
                className={newMessages[client.client_id] ? "bold-text" : ""}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box className="chat-section">
        <Box className="messages-box" sx={{ position: "relative" }}>
          {messages.map((msg) => (
            <MessageItem
              key={msg.message_id}
              msg={msg}
              onEdit={() => handleEditClick(msg)}
              onDelete={() => handleDeleteMessage(msg)}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onReply={() => handleReply(msg)}
              isEditing={editingMessageId === msg.message_id}
              editedMessage={editedMessage}
              setEditedMessage={setEditedMessage}
              messages={messages}
            />

          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box className="message-input-container" sx={{borderRadius: "24px !important" }}>
          <IconButton component="label" sx={{height:"5vh"}}>
            <AttachFileIcon />
            <input type="file" hidden onChange={(e) => handleFileChange(e)} />
          </IconButton>
          {filePreview && !isImageFile(selectedFile?.name) && (
        <Box sx={{ position: "absolute", top: "4vh", right: "1.5vw", border: "1px solid #ccc", borderRadius: "24px", maxHeight: "37vh", overflow: "hidden" , zIndex: "2" , maxWidth: "22vw" }}>
          <img src={filePreview} alt="File preview" style={{  height: "68vh"}} />
          <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff",
        borderTop: "1px solid #ccc",
        borderBottomLeftRadius: "24px",
        borderBottomRightRadius: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: "-38vh",
        height: "6vh",
        position: "relative",
        zIndex: "2"
      }}
    >
      <Typography sx={{ fontSize: "16px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" , marginTop: "1vh", display: "flex", marginRight: "1vw"}}>
      {selectedFile?.name}
        <Typography sx={{marginLeft: "1vw"}}> {getFileIcon(selectedFile?.name)}</Typography>

      </Typography>
    </Box>
        </Box>
      )}
          {filePreview && isImageFile(selectedFile?.name) && (
  <Box
    sx={{
      position: "absolute",
      top: "4vh",
      right: "1.5vw",
      border: "2px solid #aaa",
      borderRadius: "16px",
      maxWidth: "50vw", // תצוגה רחבה יותר
      maxHeight: "70vh", // גובה גדול יותר
      overflow: "hidden",
      zIndex: "2",
    }}
  >
    <img
      src={filePreview}
      alt="Image preview"
      style={{
        width: "100%",
        height: "auto", // שומר על הפרופורציות
        objectFit: "contain", // התאמת התמונה לתיבה
      }}
    />
         <Box
      sx={{
        width: "100%",
        backgroundColor: "#fff",
        borderTop: "1px solid #ccc",
        borderBottomLeftRadius: "24px",
        borderBottomRightRadius: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: "-1vh",
        height: "6vh",
        position: "relative",
        zIndex: "2"
      }}
    >
      <Typography sx={{ fontSize: "16px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" , marginTop: "1vh", display: "flex", marginRight: "1vw"}}>
      {selectedFile?.name}
        <Typography sx={{marginLeft: "1vw"}}> {getFileIcon(selectedFile?.name)}</Typography>

      </Typography>
    </Box>

  </Box>
)}
          {messageContent ? (

            <TextField

              sx={{
                borderRightWidth: "0px",
                maxWidth: "50vw",
                wordWrap: "break-word",
                whiteSpace: "normal",
                overflowY: "auto",
                direction: "rtl",
                borderRadius: "24px !important",
                paddingTop:"1vh",
                
                "& .MuiInputBase-root .MuiInputBase-input": {
                  marginTop: "2vh",  // מרווח תחתון לתוכן (ה-placeholder)
                  
                },
              }}
              value={newMessage}  // הצגת הציטוט והתגובה המשותפת
              onChange={(e) => setNewMessage(e.target.value)}  // עדכון רק בתגובה
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your message..."  // הודעה חדשה
              InputProps={{
                startAdornment: (
                  
                  <Box sx={{minWidth: "16px !important", width: "16px !important",height: "7vh", borderTopRightRadius: "16px !important"
                    ,borderRight: "3px solid #2d6a9c !important", borderTop: "3px solid #2d6a9c !important"}}>
                  <InputAdornment position="start" sx={{ lineHeight: "1", marginTop: "2vh" , marginRight:"1.5vw"}}>
                    <Typography sx={{fontFamily: "Roboto, Helvetica, Arial, sans-serif", fontSize:"14px", maxHeight:"6vh", overflow: "initial",overflowY: "clip"}}>
                 
                      <strong>{messageSender}</strong>
                      <Typography sx={{fontFamily: "Roboto, Helvetica, Arial, sans-serif", marginBottom: "1vh" ,wordWrap: "break-word",
                  whiteSpace: "normal",width:"46vw"}} >
                    <strong>{messageContent}</strong>
                    </Typography> 
                    </Typography>
                    <IconButton
            sx={{
              position: "absolute",
              top: "-0.5vh",
              left: "0.3vw",
              fontSize: "3vh",
            }}
            onClick={() => {
              setMessageContent(""); // מנקה את תוכן ההודעה המקורית
              setMessageSender("");  // מנקה את שם השולח
              setReplyToMessageId(null);  // מבטל את השב
            }}
          >
            × {/* כפתור סגירה */}
          </IconButton>
                  </InputAdornment>
                  </Box>
                  
                ),
                
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!e.shiftKey) {  // אם לא לחוצים Shift
                    handleSendMessage();  // שליחה של ההודעה
                    e.preventDefault();  // מונע ירידה לשורה חדשה
                  }
                }
              }}
            />

          ) : (
            
              <TextField

                sx={{
                  borderRightWidth: "0px",
                  maxWidth: "50vw",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  overflowY: "auto",
                  direction: "rtl",
                  borderRadius: "5vh",
                  "& .css-w4nesw-MuiInputBase-input-MuiOutlinedInput-input":{
                    marginTop: selectedFile ? "39vh" : "auto",
                  
                  },
                  "& .MuiInputBase-root.MuiOutlinedInput-root": {  // שינוי הסטייל של רכיב ה-OutlinedInput
                    minHeight: selectedFile ? "45vh": "auto"},
                }}
                value={newMessage}  // הצגת הציטוט והתגובה המשותפת
                onChange={(e) => setNewMessage(e.target.value)}  // עדכון רק בתגובה
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message..."  // הודעה חדשה
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!e.shiftKey) {  // אם לא לחוצים Shift
                      handleSendMessage();  // שליחה של ההודעה
                      e.preventDefault();  // מונע ירידה לשורה חדשה
                    }
                  }
                }}
              />
       

        )}



            </Box>
        </Box>
      </Box >
      );
};

      export default Messages;






















































      
      