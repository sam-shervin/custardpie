// FILE: components/QueryForm.tsx
import React from "react";

interface QueryFormProps {
    selectedModel: string | null;
    query: string;
    response: string | null;
    onQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onQuerySubmit: () => void;
}

const QueryForm: React.FC<QueryFormProps> = ({
    selectedModel,
    query,
    response,
    onQueryChange,
    onQuerySubmit,
}) => {
    return (
        <section className="w-2/3 rounded-r-3xl bg-[#E4D9FF] overflow-y-auto flex flex-col items-center justify-center text-center">
            {selectedModel && (
                <div className="p-4">
                    <h2 className="text-3xl font-bold mb-4">{selectedModel}</h2>
                    <div className="mt-4">
                        <input
                            type="text"
                            value={query}
                            onChange={onQueryChange}
                            placeholder="Enter your query"
                            className="w-full p-2 bg-[#30343F] text-[#E4D9FF] rounded"
                        />
                        <button
                            onClick={onQuerySubmit}
                            className="bg-[#273469] text-white px-4 py-2 rounded mt-6"
                        >
                            Submit Query
                        </button>
                    </div>
                    {response && (
                        <div className="mt-4 p-2 bg-[#30343F] text-[#E4D9FF] rounded text-left">
                            <h3 className="text-xl text-center">Response</h3>
                            <p>{response}</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default QueryForm;
