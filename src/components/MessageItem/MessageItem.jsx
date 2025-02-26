import React, { useEffect, useState } from "react";
import { fetchSenderName, markMessageAsTask } from "../../api/api"; // ייבוא הפונקציה
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import TaskIcon from "@mui/icons-material/Task";
import ReplyIcon from "@mui/icons-material/Reply";
import {
    Box,
    Typography,
    TextField,
    Menu,
    MenuItem,

    IconButton,
} from "@mui/material";

import { BsFillFileWordFill, BsFillFilePdfFill, BsFillFileExcelFill } from "react-icons/bs";
import { FaFileImage, FaFileAlt, FaFileVideo } from "react-icons/fa";
import { PiMicrosoftPowerpointLogoFill } from "react-icons/pi";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download"; 
import { AiFillFileWord } from "react-icons/ai";
const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt size={24} color="gray" />; // ברירת מחדל - אייקון קובץ כללי
    const ext = fileName.split(".").pop().toLowerCase();
  
    switch (ext) {
        case "doc":
            case "docx":
              return <AiFillFileWord style={{ width: "90px", height: "24px", color: "blue" }} />;
            
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

const MessageItem = ({ msg, onEdit, onDelete, onSaveEdit, onCancelEdit,onReply, isEditing, editedMessage, setEditedMessage, messages }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [hover, setHover] = useState(false);
    const [parentMessage, setParentMessage] = useState(false);
    const[senderName, setSenderName]=useState(null)
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    useEffect(() => {

        const findParentMessageContent = async () => {

            if (msg.parent_message_id) {
                const parentMessage = messages.find(ms => ms.message_id === msg.parent_message_id);
                if (parentMessage) {
                    setParentMessage(parentMessage);
                    const senderId = parentMessage.status === "received" ? parentMessage.client_id : parentMessage.employee_id;
                    const senderType = parentMessage.status === "received" ? "client" : "employee";
                    const sender = await fetchSenderName(senderId , senderType);
                    setSenderName(sender)
                }
            }
        };
        findParentMessageContent();
    }, [msg.parent_message_id, messages]); // תלות בהודעות כדי להתעדכן אם הן משתנות
    const handleMarkAsTask = async (msg) => {
        try {
            await markMessageAsTask(msg.message_id);
            alert("Message marked as task successfully!");
        } catch (error) {
            alert("Failed to mark message as task.");
        }
 
    };
    const handleFileDownload = (fileName, fileUrl) => {
        const link = document.createElement("a");
        link.href = fileUrl; // כאן נניח שהשרת מספק את ה-URL להורדה
        link.download = fileName;
        link.click();
        window.open(fileUrl, "_blank"); // פותח את הקובץ לאחר ההורדה

      };
    return (
        
        <Box
            className={`message ${msg.direction}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            sx={{ position: "relative", display: "flex", alignItems: "left", flexDirection: "column", maxWidth: "44vw",    borderRadius: msg.parent_message_id ? "16px" : "8px", // שינוי דינמי של ה-border-radius
            }}
        >

                  {msg.parent_message_id && (
        <Box sx={{ padding: "10px", backgroundColor: "#fff", borderTopRightRadius: "16px", borderTopLeftRadius:"16px", width:"auto",marginRight:"-0.2vw", marginLeft:"-0.4vw",marginTop:"-1vh", border:"1px solid lightBlue", borderBottom:"none", display:"flex", flexDirection:"row-reverse" ,wordWrap: "break-word",
            whiteSpace: "normal"}}>
          <Box sx={{minWidth: "16px !important", width: "16px !important", height: "100%", borderTopRightRadius: "16px !important" , borderRight: "3px solid #2d6a9c !important", borderTop: "3px solid #2d6a9c !important", padding:"9px 0", marginTop:"-1.3vh", marginRight:"-0.8vw"}}>  </Box>
          <Typography variant="body2" sx={{ color: "#333", fontStyle: "italic", direction: "rtl", display:"flex", flexDirection:"column"}}>{senderName}</Typography>
          <Typography sx={{ color: "#333", marginBottom: "8px", direction: "rtl", display:"flex", flexDirection:"column-reverse", marginTop:"3vh", marginRight:"-1vw", marginBottom:"0" }}>{parentMessage.content}</Typography>
          
        </Box>
      )}

            
            {isEditing && (
                <Box className="message-edit-box">
                    <TextField
                        fullWidth
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        size="small"
                        multiline
                        maxRows={4}
                        sx={{
                            maxWidth: "50vw", // הגבלת הרוחב
                            wordWrap: "break-word", // שובר מילים אם יש צורך
                            whiteSpace: "normal", // מאפשר יצירת שורות חדשות
                            overflowY: "auto",
                            direction: "rtl",
                            wordWrap: "break-word",
                            whiteSpace: "pre-wrap"
                        }}

                    />
                    <IconButton onClick={onSaveEdit} color="primary">
                        <SaveIcon />
                    </IconButton>
                    <IconButton onClick={onCancelEdit} color="error">
                        <CloseIcon />
                    </IconButton>
                </Box>
            ) }

            {/* כפתור 3 נקודות - מופיע רק כשעומדים על ההודעה */}
            {hover && (
                <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{ position: "absolute",  left: msg.direction === "out" ? "-2vw" : "auto", 
            right: msg.direction === "out" ? "auto" : "-2vw", top: "50%", transform: "translateY(-50%)", }}
                >
                    <MoreVertIcon />
                </IconButton>
            )}

            {/* תפריט נפתח */}
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                {msg.direction === "out" && (<MenuItem
                    onClick={() => {
                        onEdit();
                        handleMenuClose();
                    }}
                >
                    <EditIcon fontSize="small" style={{ marginRight: 8 }} /> עריכה
                </MenuItem>)}
                <MenuItem
                    onClick={() => {
                        onReply(msg); // פונקציה שתטפל בתגובה להודעה
                        handleMenuClose();
                    }}
                >
                    <ReplyIcon fontSize="small" style={{ marginRight: 8 }} /> תשובה
                </MenuItem>

                {msg.direction === "out" && (<MenuItem
                    onClick={() => {
                        onDelete();
                        handleMenuClose();
                    }}
                >

                    <DeleteIcon fontSize="small" style={{ marginRight: 8 }} /> מחיקה
                </MenuItem>)}
                <MenuItem
                    onClick={() => {
                        handleMarkAsTask(msg);
                        handleMenuClose();
                    }}
                >
                    <TaskIcon fontSize="small" style={{ marginRight: 8 }} /> סימון כמשימה
                </MenuItem>

            </Menu>
            {msg.message_type === "FILE" ? (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      border: "10px solid #a6a0a0", // מסגרת אפורה כהה
      borderRadius: "8px",
      width: "13vw",
      height: "17vh",
      position: "relative",
      backgroundColor: "#f9f9f9",
      overflow: "hidden",
    }}
  >
    {/* כפתור ההורדה - ממורכז באמצע התיבה */}
    <IconButton
      onClick={() => handleFileDownload(msg.content, msg.file_url)}
      sx={{
        position: "absolute",
        top: "33%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "0.3s",
        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
      }}
    >
      <DownloadIcon fontSize="large" />
    </IconButton>

    {/* מסגרת תחתונה עבה יותר */}
    <Box
      sx={{
        position: "absolute",
        bottom: "0",
        width: "100%",
        backgroundColor: "#a6a0a0", // רקע כהה למסגרת התחתונה
        color: "white",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "bold",
        gap: "0.75vw"
      }}
    >
      <Typography sx={{ marginLeft: "8px", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {msg.content}
      </Typography>

      {getFileIcon(msg.content)} {/* אייקון מותאם לקובץ */}

    </Box>
  </Box>
) : (

    
        <>          <Typography className="message-content" sx={{ marginBottom: 1, textAlign: msg.direction === "out" ? "right" : "left", maxWidth: "50vw", wordWrap: "break-word", whiteSpace: "pre-wrap",marginTop:"1vh" }}>{msg.content}</Typography> {/* מוסיפה רווח מתחת לתוכן */}
            <Typography variant="caption" className="timestamp" sx={{ color: "gray", textAlign: msg.direction === "out" ? "right" : "left" }}>{msg.timestamp}</Typography> {/* ניתן לשנות צבע של הזמן */}
        </>
    
)}
        </Box>
    );
};
export default MessageItem;









