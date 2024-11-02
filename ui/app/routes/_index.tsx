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
        if (isCreatingModel) {
            setIsCreatingModel(false);
        }
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
            <section className="h-[calc(100vh-10vh)] w-[calc(100vw-10vh)]  rounded-3xl text-[#1E2749] flex shadow-xl font-jose">
                <section className="w-1/5 flex flex-col font-jose rounded-l-3xl bg-[#E4D9FF]">
                    <section className="text-9xl h-full overflow-y-auto overflow-x-hidden px-3 flex flex-col items-center justify-center relative">
                        <section className="border rounded-3xl border-[#1E2749] py-6 mb-12">
                            <section className="flex items-center text-3xl font-semibold justify-center mr-6 pt-4">
                                <img
                                    src="/logo.png"
                                    className="w-[100px]"
                                    alt=""
                                />
                                <section>CustardPie</section>
                            </section>
                            <section className="px-4 py-3">
                                <p className="text-lg text-center">
                                    CustardPie is a SaaS platform that provides
                                    a simple way to customize LLM models per
                                    your needs.
                                </p>
                            </section>
                        </section>
                        {models.map((model, index) => (
                            <div
                                key={index}
                                className={`text-xl mb-2 cursor-pointer w-full rounded-3xl py-2 text-center ${
                                    selectedModel === model
                                        ? "bg-[#30343F] text-[#FAFAFF]"
                                        : ""
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
                        <button
                            onClick={handleCreateModel}
                            className="text-[#30343F] text-4xl border w-full border-[#30343F] rounded-3xl hover:bg-[#273469] hover:text-[#FAFAFF] mb-36"
                        >
                            +
                        </button>
                    </section>
                </section>
                <section className="w-4/5 flex">
                    <section className="w-1/3 bg-[#273469] items-center justify-around text-[#fafaff] text-center px-3 flex flex-col py-4 text-2xl overflow-y-auto">
                        {/* RAG Toggle */}
                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={isRAGOn}
                                    onChange={() => setIsRAGOn(!isRAGOn)}
                                />
                                <span className="font-bold text-4xl">RAG</span>
                            </label>

                            {isRAGOn && (
                                <div className="mt-2 space-y-2">
                                    {/* Folder Selector for RAG */}
                                    <div>
                                        <input
                                            id="ragFolder"
                                            type="file"
                                            className="w-full p-2 bg-[#30343F] rounded"
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
                                            className="w-full p-2 bg-[#30343F] rounded"
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
                                <span className="font-bold text-4xl">
                                    Fine-tune
                                </span>
                            </label>
                            {isFineTuneOn && (
                                <div className="mt-2 space-y-2">
                                    {/* Folder Selector for Fine-tune */}
                                    <div>
                                        <input
                                            id="fineTuneFolder"
                                            type="file"
                                            className="w-full p-2 bg-[#30343F] rounded"
                                            multiple
                                            ref={fineTuneFolderRef}
                                            onChange={
                                                handleFineTuneFolderSelect
                                            }
                                        />
                                    </div>
                                    {/* Website Links Adder for Fine-tune */}
                                    <div>
                                        <input
                                            id="fineTuneWebsiteLink"
                                            type="text"
                                            placeholder="Enter website link"
                                            className="w-full p-2 bg-[#30343F] rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Submit Button */}
                        <div className="mt-4">
                            <button
                                onClick={handleSubmit}
                                className="bg-[#E4D9FF] text-[#30343F] px-4 py-2 rounded"
                            >
                                Submit Files
                            </button>
                        </div>
                    </section>
                    <section className="w-2/3 rounded-r-3xl bg-[#E4D9FF] overflow-y-auto flex flex-col items-center justify-center text-center">
                        {isCreatingModel && (
                            <div className="p-4">
                                <h2 className="text-2xl font-semibold mb-4">
                                    Create New Model
                                </h2>
                                <input
                                    type="text"
                                    value={modelName}
                                    onChange={handleModelNameChange}
                                    onKeyDown={handleModelNameSave}
                                    placeholder="Enter model name"
                                    className="w-full p-2 bg-[#30343F] rounded"
                                />
                            </div>
                        )}
                        {!isCreatingModel && selectedModel && (
                            <div className="p-4">
                                <h2 className="text-3xl font-bold mb-4">
                                    {selectedModel}
                                </h2>
                                <div className="mt-4">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={handleQueryChange}
                                        placeholder="Enter your query"
                                        className="w-full p-2 bg-[#30343F] text-[#E4D9FF] rounded"
                                    />
                                    <button
                                        onClick={handleQuerySubmit}
                                        className="bg-[#273469] text-white px-4 py-2 rounded mt-6"
                                    >
                                        Submit Query
                                    </button>
                                </div>
                                {response && (
                                    <div className="mt-4 p-2 bg-[#30343F] text-[#E4D9FF] rounded text-left">
                                        {!response ? (
                                            <h3 className="text-xl text-center">
                                                Response
                                            </h3>
                                        ) : (
                                            <p>{response}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </section>
            </section>
        </>
    );
}
