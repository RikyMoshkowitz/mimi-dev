import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getClientsByEmployee, getTasksByEmployee, getMessagesByEmployee } from "../api/api";

const Dashboard = () => {
    const [clients, setClients] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    // בדיקת טוקן והבאת נתונים
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            
            navigate("/login");
        } else {
            fetchData();
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [clientsData, tasksData, messagesData] = await Promise.all([
                getClientsByEmployee(state?.employeeId),
                getTasksByEmployee(state?.employeeId),
                getMessagesByEmployee(state?.employeeId),
            ]);
            setClients(clientsData);
            setTasks(tasksData);
            setMessages(messagesData);
        } catch (err) {
            setError("Failed to load data. Please try again.");
        }
    };

    return (
        <div>
            <h1>Dashboard</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div>
                <h2>Clients</h2>
                <ul>
                    {clients.map((client) => (
                        <li key={client.client_id}>
                            {client.name} - {client.phone}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>Tasks</h2>
                <ul>
                    {tasks.map((task) => (
                        <li key={task.task_id}>
                            {task.description} (Status: {task.status})
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>Messages</h2>
                <ul>
                    {messages.map((message) => (
                        <li key={message.message_id}>
                            {message.content} ({message.direction})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
