import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    const nextFormData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    if (fieldName === 'username') {
      nextFormData.username = fieldValue;
    }

    if (fieldName === 'email') {
      nextFormData.email = fieldValue;
    }

    if (fieldName === 'password') {
      nextFormData.password = fieldValue;
    }

    setFormData(nextFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('LoginPage: handleSubmit start', { isLogin: isLogin, email: formData.email });

    setError('');
    setLoading(true);

    try {
      let response = null;

      if (isLogin) {
        console.log('LoginPage: sending login request');
        response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        console.log('LoginPage: sending register request');
        response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }

      console.log('LoginPage: auth success');

      if (response && response.data) {
        auth.login(response.data.token, response.data.user);
      }

      navigate('/');
    } catch (err) {
      console.log(err);

      let message = 'Something went wrong';
      if (err && err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }

      setError(message);
    } finally {
      setLoading(false);
      console.log('LoginPage: handleSubmit end');
    }
  };

  const handleToggleMode = () => {
    console.log('LoginPage: toggle mode');

    if (isLogin) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }

    setError('');
  };

  let subtitleText = '';
  if (isLogin) {
    subtitleText = 'Welcome back!';
  } else {
    subtitleText = 'Join the RetroWave experience';
  }

  let errorBlock = null;
  if (error) {
    errorBlock = (
      <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
        <i className="fas fa-exclamation-circle mr-2"></i>
        {error}
      </div>
    );
  }

  let usernameField = null;
  if (!isLogin) {
    usernameField = (
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
          placeholder="Choose a username"
          required
        />
      </div>
    );
  }

  let submitText = '';
  if (loading) {
    submitText = '';
  } else if (isLogin) {
    submitText = 'Log In';
  } else {
    submitText = 'Sign Up';
  }

  let switchText = '';
  if (isLogin) {
    switchText = "Don't have an account? Sign up";
  } else {
    switchText = 'Already have an account? Log in';
  }

  let submitContent = null;
  if (loading) {
    submitContent = <i className="fas fa-spinner fa-spin"></i>;
  } else {
    submitContent = submitText;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 neon-glow">
            <i className="fas fa-music text-4xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SoundWave
          </h1>
          <p className="text-gray-400">{subtitleText}</p>
        </div>

        {errorBlock}

        <form onSubmit={handleSubmit} className="space-y-4">
          {usernameField}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
          >
            {submitContent}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleToggleMode}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            {switchText}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center text-sm text-gray-400">
          <p className="mb-1 font-medium text-gray-300">Demo Account:</p>
          <p>Email: <span className="text-blue-400 font-mono">demo@soundwave.com</span></p>
          <p>Password: <span className="text-blue-400 font-mono">demo123</span></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
