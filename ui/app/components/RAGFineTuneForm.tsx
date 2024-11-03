// FILE: components/RAGFineTuneForm.tsx
import React, { useEffect } from "react";

interface RAGFineTuneFormProps {
    isRAGOn: boolean;
    isFineTuneOn: boolean;
    onToggleRAG: () => void;
    onToggleFineTune: () => void;
    onRagFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFineTuneFolderSelect: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    onSubmit: () => void;
    ragFolderRef: React.RefObject<HTMLInputElement>;
    fineTuneFolderRef: React.RefObject<HTMLInputElement>;
}

const RAGFineTuneForm: React.FC<RAGFineTuneFormProps> = ({
    isRAGOn,
    isFineTuneOn,
    onToggleRAG,
    onToggleFineTune,
    onRagFolderSelect,
    onFineTuneFolderSelect,
    onSubmit,
    ragFolderRef,
    fineTuneFolderRef,
}) => {
    useEffect(() => {
        if (ragFolderRef.current) {
            ragFolderRef.current.setAttribute("webkitdirectory", "true");
        }
        if (fineTuneFolderRef.current) {
            fineTuneFolderRef.current.setAttribute("webkitdirectory", "true");
        }
    }, [isRAGOn, isFineTuneOn, ragFolderRef, fineTuneFolderRef]);
    return (
        <section className="w-1/3 bg-[#273469] items-center justify-around text-[#fafaff] text-center px-3 flex flex-col py-4 text-2xl overflow-y-auto">
            {/* RAG Toggle */}
            <div className="mb-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isRAGOn}
                        onChange={onToggleRAG}
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
                                onChange={onRagFolderSelect}
                            />
                        </div>
                        {/* Website Links Adder for RAG */}
                        <div>
                            <textarea
                                id="ragWebsiteLink"
                                placeholder="Enter website link"
                                className="w-full p-2 bg-[#30343F] text-sm rounded"
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
                        onChange={onToggleFineTune}
                    />
                    <span className="font-bold text-4xl">Fine-tune</span>
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
                                onChange={onFineTuneFolderSelect}
                            />
                        </div>
                        {/* Website Links Adder for Fine-tune */}
                        <div>
                            <textarea
                                id="fineTuneWebsiteLink"
                                placeholder="Enter website link"
                                className="w-full p-2 bg-[#30343F] text-sm rounded"
                            />
                        </div>
                    </div>
                )}
            </div>
            {/* Submit Button */}
            <div className="mt-4">
                <button
                    onClick={onSubmit}
                    className="bg-[#E4D9FF] text-[#30343F] px-4 py-2 rounded"
                >
                    Submit
                </button>
            </div>
        </section>
    );
};

export default RAGFineTuneForm;
