import React from 'react';

interface LandingPageProps {
    onNavigateToLogin: () => void;
    onNavigateToRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-white to-accent/20"></div>
            <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 15% 25%, #6EE7B744, transparent 40%), radial-gradient(circle at 85% 75%, #FDBA7444, transparent 40%)'
            }}></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="flex flex-col justify-center items-center mb-6">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                        <svg className="w-24 h-24 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 3.16 2.03 5.84 4.85 6.71L12 22l2.15-6.29C16.97 14.84 19 12.16 19 9c0-3.87-3.13-7-7-7zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-neutral-800 mt-6 tracking-tight">Mocktail Juice Town</h1>
                    <p className="mt-4 text-xl text-neutral-600 max-w-2xl">
                        Discover a world of refreshing mocktails, delicious momos, and creamy shakes. Your perfect treat is just a click away.
                    </p>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onNavigateToLogin}
                        className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-lg text-lg"
                    >
                        Login to Your Account
                    </button>
                    <button
                        onClick={onNavigateToRegister}
                        className="w-full sm:w-auto px-8 py-4 bg-white text-primary border-2 border-primary hover:bg-primary/10 font-bold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-lg text-lg"
                    >
                        Create an Account
                    </button>
                </div>
            </div>
            <footer className="absolute bottom-8 text-neutral-500 text-sm z-10">
                &copy; {new Date().getFullYear()} Mocktail Juice Town. All Rights Reserved.
            </footer>
        </div>
    );
};

export default LandingPage;