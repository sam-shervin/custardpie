// FILE: LoadingScreen.tsx

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="text-white text-2xl">Loading...</div>
        </div>
    );
};

export default LoadingScreen;
