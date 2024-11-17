// FILE: hooks/useModels.ts
import { useState, useEffect } from "react";

const useModels = () => {
    const [models, setModels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("http://127.0.0.1:5000/models");
                const data = await response.json();
                setModels(data.models);
                setIsLoading(false);
                return true; // Indicate success
            } catch (error) {
                console.error("Error fetching models:", error);
                return false; // Indicate failure
            }
        };

        // Fetch models immediately and then every 5 seconds until successful
        const checkServer = async () => {
            const success = await fetchModels();
            if (success) {
                clearInterval(intervalId);
            }
        };

        checkServer();
        const intervalId = setInterval(checkServer, 5000);

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return { models, isLoading, setIsLoading, setModels };
};

export default useModels;
