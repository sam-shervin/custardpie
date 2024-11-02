// FILE: components/ModelList.tsx
import React from "react";

interface ModelListProps {
    models: string[];
    selectedModel: string | null;
    onSelectModel: (model: string) => void;
    onCreateModel: () => void;
}

const ModelList: React.FC<ModelListProps> = ({
    models,
    selectedModel,
    onSelectModel,
    onCreateModel,
}) => {
    return (
        <section className="text-9xl h-full overflow-y-auto overflow-x-hidden px-3 flex flex-col items-center justify-center relative">
            <section className="border rounded-3xl border-[#1E2749] py-6 mb-12">
                <section className="flex items-center text-3xl font-semibold justify-center mr-6 pt-4">
                    <img src="/logo.png" className="w-[100px]" alt="" />
                    <section>CustardPie</section>
                </section>
                <section className="px-4 py-3">
                    <p className="text-lg text-center">
                        CustardPie is a SaaS platform that provides a simple way
                        to customize LLM models per your needs.
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
                    onClick={() => onSelectModel(model)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            onSelectModel(model);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    {model}
                </div>
            ))}
            <button
                onClick={onCreateModel}
                className="text-[#30343F] text-4xl border w-full border-[#30343F] rounded-3xl hover:bg-[#273469] hover:text-[#FAFAFF] mb-36"
            >
                +
            </button>
        </section>
    );
};

export default ModelList;
