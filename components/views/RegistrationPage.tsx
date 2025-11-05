import React, { useState } from 'react';

interface RegistrationPageProps {
    onRegister: (name: string, email: string, pass: string) => boolean;
    onNavigateToLogin: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onRegister, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        onRegister(name, email, password);
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-primary/5" style={{
                backgroundImage: 'radial-gradient(circle at 10% 20%, #6EE7B7, transparent 40%), radial-gradient(circle at 80% 90%, #FDBA74, transparent 40%)'
            }}></div>
            <div className="max-w-md w-full mx-auto z-10">
                 <div className="flex flex-col justify-center items-center mb-6">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                        <svg className="w-16 h-16 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 3.16 2.03 5.84 4.85 6.71L12 22l2.15-6.29C16.97 14.84 19 12.16 19 9c0-3.87-3.13-7-7-7zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-neutral-800 mt-4">Mocktail Juice Town</h1>
                </div>
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/20">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-neutral-700">Create an Account</h2>
                        <p className="text-neutral-500">Join us and enjoy delicious mocktails!</p>
                    </div>
                     {error && <p className="bg-red-100 text-red-700 text-center p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-neutral-700 block mb-2">Full Name</label>
                            <input
                                type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-white/50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-neutral-700 block mb-2">Email Address</label>
                            <input
                                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-white/50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password"  className="text-sm font-medium text-neutral-700 block mb-2">Password</label>
                            <input
                                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-white/50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword"  className="text-sm font-medium text-neutral-700 block mb-2">Confirm Password</label>
                            <input
                                type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 bg-white/50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transform mt-4">
                            Register
                        </button>
                    </form>
                    <p className="text-center text-sm text-neutral-600 mt-6">
                        Already have an account?{' '}
                        <button onClick={onNavigateToLogin} className="font-medium text-primary hover:underline">
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;