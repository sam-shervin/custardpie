import { useState } from "react";

export default function Index() {
    const [inputValue, setInputValue] = useState("");
    const [response, setResponse] = useState("");
    const [error, setError] = useState("");

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setResponse(""); // Clear previous response
            setError(""); // Clear previous error
            try {
                const res = await fetch("http://localhost:11434/api/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama3.1", // or whichever model you're using
                        prompt: inputValue,
                    }),
                });

                const reader = res.body?.getReader();
                const decoder = new TextDecoder("utf-8");
                let result = "";

                while (reader) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    // Decode the chunk and process the JSON objects
                    const chunk = decoder.decode(value, { stream: true });

                    // Split the chunk by newlines to process each JSON response
                    const lines = chunk.split("\n").filter(Boolean);
                    for (const line of lines) {
                        try {
                            const jsonResponse = JSON.parse(line);
                            if (jsonResponse.response) {
                                result += jsonResponse.response; // Accumulate the response
                            }
                            if (jsonResponse.done) {
                                break; // Exit loop when done
                            }
                        } catch (err) {
                            console.error("Error parsing JSON:", err);
                        }
                    }

                    setResponse(result); // Update the UI with the accumulated response
                }
            } catch (err: any) {
                console.error("Error:", err);
                setError(err.message || "An error occurred");
            }
        }
    };

    return (
        <>
            <section className="h-screen bg-teal-950 text-white">
                <section className="bg-transparent flex justify-center">
                    <input
                        className="my-12 mx-12 pl-4 rounded-3xl p-2 text-xl bg-teal-900 w-[50vw]"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a prompt and press Enter"
                    />
                </section>
                <section className="flex justify-center">
                    {response && (
                        <div className="text-white text-sm mt-4">
                            {response}
                        </div>
                    )}
                    {error && (
                        <div className="text-red-500 text-xl mt-4">
                            Error: {error}
                        </div>
                    )}
                </section>
            </section>
        </>
    );
}
