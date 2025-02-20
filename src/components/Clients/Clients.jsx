import React, { useEffect, useState } from 'react';
import { fetchClients, addClient, updateClient } from "../../api/api";
import { styled } from "@mui/system";

import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', employee_id: '' });
    const [selectedClient, setSelectedClient] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchClients().then(setClients).catch(console.error);
    }, []);

    const handleInputChange = (e, isEdit = false) => {
        const { name, value } = e.target;
        if (isEdit) {
            setSelectedClient({ ...selectedClient, [name]: value });
        } else {
            setNewClient({ ...newClient, [name]: value });
        }
    };

    const handleAddClient = async () => {
        try {
            const addedClient = await addClient(newClient);
            setClients([...clients, addedClient]);
            setNewClient({ name: '', phone: '', email: '', employee_id: '' });
            setOpenDialog(false);
        } catch (error) {
            console.error("Error adding client:", error);
        }
    };

    const handleUpdateClient = async () => {
        try {
            const updatedClient = await updateClient(selectedClient.client_id, selectedClient);
            setClients(
                clients.map((client) =>
                    client.client_id === updatedClient.client_id ? updatedClient : client
                )
            );
            setEditMode(false);
            setSelectedClient(null);
            setOpenDialog(false);
        } catch (error) {
            console.error("Error updating client:", error);
        }

    };
    const StyledButton = styled(Button)({
        bottom: "-2vh",
        backgroundColor: "#2d6a9c"
    })

    return (
        <Container >
            <Typography variant="h4" sx={{ padding: "20px 0", color: "#2d6a9c" }}>
                Clients
            </Typography>

            <List>
                {clients.map((client) => (
                    <ListItem
                        key={client.client_id}
                        sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd' }}
                    >
                        <ListItemText
                            primary={client.name}
                            secondary={`${client.phone} | ${client.email || "N/A"}`}
                        />
                        <Button sx={{backgroundColor:"#2d6a9c" , color: "white"}}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                setSelectedClient(client);
                                setEditMode(true);
                                setOpenDialog(true);
                            }}
                        >
                            Edit
                        </Button>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ textAlign: "center", marginTop: 4 }}>
                <StyledButton
                    variant="contained"
                    size="large"
                    onClick={() => {
                        setNewClient({ name: '', phone: '', email: '', employee_id: '' });
                        setEditMode(false);
                        setOpenDialog(true);
                    }}
                >
                    Add New Client
                </StyledButton>
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{editMode ? "Edit Client" : "Add New Client"}</DialogTitle>
                <DialogContent>
                    <Box className="messages-box"
                        component="form"
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}
                    >
                        <TextField
                            label="Name"
                            name="name"
                            value={editMode ? selectedClient.name : newClient.name}
                            onChange={(e) => handleInputChange(e, editMode)}
                            required
                        />
                        <TextField
                            label="Phone"
                            name="phone"
                            value={editMode ? selectedClient.phone : newClient.phone}
                            onChange={(e) => handleInputChange(e, editMode)}
                            required
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={editMode ? selectedClient.email : newClient.email}
                            onChange={(e) => handleInputChange(e, editMode)}
                            type="email"
                        />
                        <TextField
                            label="Employee ID"
                            name="employee_id"
                            value={editMode ? selectedClient.employee_id : newClient.employee_id}
                            onChange={(e) => handleInputChange(e, editMode)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={editMode ? handleUpdateClient : handleAddClient}
                    >
                        {editMode ? "Update Client" : "Add Client"}
                    </Button>
                </DialogActions>
            </Dialog>
            
        </Container>
        
    );
};

export default Clients;
