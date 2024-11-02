import React, { useState, useRef, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";

export default function Index() {
    const [isRAGOn, setIsRAGOn] = useState(false);
    const [isFineTuneOn, setIsFineTuneOn] = useState(false);
    const [ragFiles, setRagFiles] = useState<FileList | null>(null);
    const [fineTuneFiles, setFineTuneFiles] = useState<FileList | null>(null);
    const [isCreatingModel, setIsCreatingModel] = useState(false);
    const [modelName, setModelName] = useState("");
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const ragFolderRef = useRef<HTMLInputElement | null>(null);
    const fineTuneFolderRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (ragFolderRef.current) {
            ragFolderRef.current.setAttribute("webkitdirectory", "true");
        }
        if (fineTuneFolderRef.current) {
            fineTuneFolderRef.current.setAttribute("webkitdirectory", "true");
        }
    }, [isRAGOn, isFineTuneOn]);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/models");
            const data = await response.json();
            setModels(data.models);
        } catch (error) {
            console.error("Error fetching models:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRagFolderSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.files) {
            setRagFiles(event.target.files);
        }
    };

    const handleFineTuneFolderSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.files) {
            setFineTuneFiles(event.target.files);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("modelName", selectedModel || "");

        // Append RAG files
        if (ragFiles) {
            Array.from(ragFiles).forEach((file) => {
                formData.append("ragFiles", file);
            });
        }

        // Append Fine-tune files
        if (fineTuneFiles) {
            Array.from(fineTuneFiles).forEach((file) => {
                formData.append("fineTuneFiles", file);
            });
        }

        try {
            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                console.log("Files uploaded successfully");
                console.log(await response.json());
            } else {
                console.error("Error uploading files");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateModel = () => {
        setIsCreatingModel(true);
    };

    const handleModelNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setModelName(event.target.value);
    };

    const handleModelNameSave = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            setModels([...models, modelName]);
            setIsCreatingModel(false);
        }
    };

    const handleModelSelect = (model: string) => {
        setSelectedModel(model);
        setRagFiles(null);
        setFineTuneFiles(null);
        setIsRAGOn(false);
        setIsFineTuneOn(false);
    };

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleQuerySubmit = async () => {
        if (!selectedModel || !query) return;

        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/rag", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ model_name: selectedModel, query }),
            });

            if (response.ok) {
                const data = await response.json();
                setResponse(data.results);
            } else {
                console.error("Error querying the model");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <LoadingScreen />}
            <section className="h-screen bg-black text-white flex">
                <section className="w-1/5 flex flex-col font-jose bg-[#522258]">
                    <section className="flex items-center text-3xl justify-center mr-6 pt-4">
                        <img src="/logo.png" className="w-[100px]" alt="" />
                        CustardPie
                    </section>
                    <section className="px-4">
                        <p className="text-sm text-left">
                            CustardPie is a SaaS platform that provides a simple
                            way to customize LLM models per your needs.
                        </p>
                    </section>
                    <section className="border text-9xl h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center relative">
                        <button
                            onClick={handleCreateModel}
                            className="text-white text-2xl absolute top-2 right-2"
                        >
                            +
                        </button>
                        {models.map((model, index) => (
                            <div
                                key={index}
                                className={`text-xl mb-2 cursor-pointer ${
                                    selectedModel === model ? "bg-gray-700" : ""
                                }`}
                                onClick={() => handleModelSelect(model)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleModelSelect(model);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                {model}
                            </div>
                        ))}
                    </section>
                </section>
                <section className="w-4/5 flex">
                    <section className="w-1/3 bg-[#8C3061] overflow-y-auto">
                        {/* RAG Toggle */}
                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={isRAGOn}
                                    onChange={() => setIsRAGOn(!isRAGOn)}
                                />
                                <span>RAG</span>
                            </label>

                            {isRAGOn && (
                                <div className="mt-2 space-y-2">
                                    {/* Folder Selector for RAG */}
                                    <div>
                                        <input
                                            id="ragFolder"
                                            type="file"
                                            className="w-full p-2 bg-gray-700 rounded"
                                            multiple
                                            ref={ragFolderRef}
                                            onChange={handleRagFolderSelect}
                                        />
                                    </div>
                                    {/* Website Links Adder for RAG */}
                                    <div>
                                        <input
                                            id="ragWebsiteLink"
                                            type="text"
                                            placeholder="Enter website link"
                                            className="w-full p-2 bg-gray-700 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Fine-tune Toggle */}
                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={isFineTuneOn}
                                    onChange={() =>
                                        setIsFineTuneOn(!isFineTuneOn)
                                    }
                                />
                                <span>Fine-tune</span>
                            </label>
                            {isFineTuneOn && (
                                <div className="mt-2 space-y-2">
                                    {/* Folder Selector for Fine-tune */}
                                    <div>
                                        <input
                                            id="fineTuneFolder"
                                            type="file"
                                            className="w-full p-2 bg-gray-700 rounded"
                                            multiple
                                            ref={fineTuneFolderRef}
                                            onChange={
                                                handleFineTuneFolderSelect
                                            }
                                        />
                                    </div>
                                    {/* Website Links Adder for Fine-tune */}
                                    <div>
                                        <label htmlFor="fineTuneWebsiteLink">
                                            Website Links:
                                        </label>
                                        <input
                                            id="fineTuneWebsiteLink"
                                            type="text"
                                            placeholder="Enter website link"
                                            className="w-full p-2 bg-gray-700 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Submit Button */}
                        <div className="mt-4">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Submit Files
                            </button>
                        </div>
                    </section>
                    <section className="w-2/3 bg-[#C63C51] overflow-y-auto">
                        {isCreatingModel && (
                            <div className="p-4">
                                <h2 className="text-2xl mb-4">
                                    Create New Model
                                </h2>
                                <input
                                    type="text"
                                    value={modelName}
                                    onChange={handleModelNameChange}
                                    onKeyDown={handleModelNameSave}
                                    placeholder="Enter model name"
                                    className="w-full p-2 bg-gray-700 rounded"
                                />
                            </div>
                        )}
                        {selectedModel && (
                            <div className="p-4">
                                <h2 className="text-2xl mb-4">
                                    Selected Model: {selectedModel}
                                </h2>
                                <div className="mt-4">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={handleQueryChange}
                                        placeholder="Enter your query"
                                        className="w-full p-2 bg-gray-700 rounded"
                                    />
                                    <button
                                        onClick={handleQuerySubmit}
                                        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                                    >
                                        Submit Query
                                    </button>
                                </div>
                                {response && (
                                    <div className="mt-4 p-2 bg-gray-800 rounded">
                                        <h3 className="text-xl">Response:</h3>
                                        <p>{response}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedModel && isRAGOn && isFineTuneOn && (
                            <div className="p-4">{"Chat part"}</div>
                        )}
                    </section>
                </section>
            </section>
        </>
    );
}
