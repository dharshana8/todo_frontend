import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './css/Auth.css';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!form.email || !form.password) {
            setError('All fields are required');
            return;
        }
        try {
            const res = await axios.post('http://localhost:5000/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    }

    return (
        <div className='auth-container'>
            <Box className='auth-box'>
                <Typography variant="h4" gutterBottom>Login</Typography>
                {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} margin="normal" />
                    <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} margin="normal" />
                    <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Login</Button>
                </form>
                <Typography sx={{ mt: 2 }}>Don't have an account? <Link to="/register">Register</Link></Typography>
            </Box>
        </div>
    )
}

export default Login;
