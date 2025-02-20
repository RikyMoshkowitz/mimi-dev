import React, { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { AppBar, Tabs, Tab, Container, Box } from "@mui/material";
import { styled } from "@mui/system";
import "./components/MainPage.css"; // ייבוא קובץ העיצוב


const StyledAppBar = styled(AppBar)({
  backgroundColor: "#B0B0B0", // Lighter dark gray background color
  borderRadius: 8, // Rounded corners
  boxShadow: "none", // Remove default shadow
});

const StyledTabs = styled(Tabs)({
  borderRadius: 8, // Rounded tabs
  '& .MuiTabs-indicator': {
    backgroundColor: '#2E2E2E', // Lighter gray indicator color
  },
});

const StyledTab = styled(Tab)({
  borderTopRightRadius: 8, // Rounded tab button
  textTransform: "none", // Prevent text from uppercase transformation
  color:"#2d6a9c",
  "&.Mui-selected": {
    color: "#2d6a9c", // Keep the same color when selected
  },
});
const StyledContainer = styled(Container)({
  marginRight: "10vw",
  height: "100vh",
  marginTop :"-10vh !important"
});



const MainPage = () => {
  const { tab } = useParams(); // Get the current tab from the URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || "Messages");
  useEffect(()=>{
    navigate(`/mainPage/Messages`)
  },[])
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(`/mainPage/${newValue.toLowerCase()}`); // include "/mainPage"
  };

  
  return (
    <div className="main-container">

<StyledContainer maxWidth="lg" key={activeTab}>
<p>hello</p>
      <StyledAppBar position="static">
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <StyledTab label="Messages" value="Messages" />
          <StyledTab label="Clients" value="Clients" />
          <StyledTab label="Tasks" value="Tasks" />
          <StyledTab label="Files" value="Files" />
        </StyledTabs>
      </StyledAppBar>
      <Box className="main-messages-box" sx={{ flexGrow: 1, overflowY: "auto", flex: 1 }}>
        <Outlet /> {/* Render the selected page based on URL */}
      </Box>
   
    </StyledContainer>
   </div>
  );
};

export default MainPage;
