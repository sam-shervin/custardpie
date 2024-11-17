// FILE: pages/Index.tsx
import React, { useState, useRef } from "react";
import LoadingScreen from "../components/LoadingScreen";
import ModelList from "../components/ModelList";
import RAGFineTuneForm from "../components/RAGFineTuneForm";
import QueryForm from "../components/QueryForm";
import useModels from "../hooks/useModels";

export default function Index() {
    const [isRAGOn, setIsRAGOn] = useState(false);
    const [isFineTuneOn, setIsFineTuneOn] = useState(false);
    const [ragFiles, setRagFiles] = useState<FileList | null>(null);
    const [fineTuneFiles, setFineTuneFiles] = useState<FileList | null>(null);
    const [isCreatingModel, setIsCreatingModel] = useState(false);
    const [modelName, setModelName] = useState("");
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const { models, isLoading, setIsLoading, setModels } = useModels();
    const ragFolderRef = useRef<HTMLInputElement | null>(null);
    const fineTuneFolderRef = useRef<HTMLInputElement | null>(null);

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
            const response = await fetch("http://127.0.0.1:5000/upload", {
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
            const response = await fetch("http://127.0.0.1:5000/rag", {
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
            <section className="h-[calc(100vh-10vh)] w-[calc(100vw-10vh)] rounded-3xl text-[#1E2749] flex shadow-2xl font-jose">
                <section className="w-1/5 flex flex-col font-jose rounded-l-3xl bg-[#E4D9FF]">
                    <ModelList
                        models={models}
                        selectedModel={selectedModel}
                        onSelectModel={handleModelSelect}
                        onCreateModel={handleCreateModel}
                    />
                    {isCreatingModel && (
                        <div className="p-4">
                            <h2 className="text-2xl mb-4">Create New Model</h2>
                            <input
                                type="text"
                                value={modelName}
                                onChange={handleModelNameChange}
                                onKeyDown={handleModelNameSave}
                                placeholder="Enter model name"
                                className="w-full p-2 bg-[#30343F] text-[#FAFAFF] rounded"
                            />
                        </div>
                    )}
                </section>
                {selectedModel ? (
                    <>
                        <RAGFineTuneForm
                            isRAGOn={isRAGOn}
                            isFineTuneOn={isFineTuneOn}
                            onToggleRAG={() => setIsRAGOn(!isRAGOn)}
                            onToggleFineTune={() =>
                                setIsFineTuneOn(!isFineTuneOn)
                            }
                            onRagFolderSelect={handleRagFolderSelect}
                            onFineTuneFolderSelect={handleFineTuneFolderSelect}
                            onSubmit={handleSubmit}
                            ragFolderRef={ragFolderRef}
                            fineTuneFolderRef={fineTuneFolderRef}
                        />
                        <QueryForm
                            selectedModel={selectedModel}
                            query={query}
                            response={response}
                            onQueryChange={handleQueryChange}
                            onQuerySubmit={handleQuerySubmit}
                        />
                    </>
                ) : (
                    <section className="w-4/5 bg-[#273469] flex items-center justify-center text-[#fafaff] text-2xl rounded-r-3xl">
                        Please select a model to continue
                    </section>
                )}
            </section>
        </>
    );
}
