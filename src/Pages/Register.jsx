import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './css/Auth.css';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.password) {
            setError('All fields are required');
            return;
        }
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, form);
            setSuccess('Registered successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    }

    return (
        <div className='auth-container'>
            <Box className='auth-box'>
                <Typography variant="h4" gutterBottom>Register</Typography>
                {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <TextField fullWidth label="Name" name="name" autoComplete="name" value={form.name} onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Email" name="email" autoComplete="email" value={form.email} onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} margin="normal" />
                    <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Register</Button>
                </form>
                <Typography sx={{ mt: 2 }}>Already have an account? <Link to="/login">Login</Link></Typography>
            </Box>
        </div>
    )
}

export default Register;
