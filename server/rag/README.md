# Retrieval-Augmented Generation (RAG) Pipeline

This README provides an overview and explanation of the RAG pipeline code, which is a key component in a larger program. The RAG pipeline integrates a vector store for embeddings and a language model (LLM) to enable document-based information retrieval and response generation. This pipeline is optimized to process and embed documents using specific embedding functions and to execute queries based on the stored embeddings.

---

## Key Components

1. **Model Initialization**:
   - The code initializes an LLM (`llm`) using `Ollama`, configured with a specified timeout.
   - Embedding models, `lc_embed_model_prompt` and `lc_embed_model_document`, are created using `HuggingFaceEmbeddings`. These models use `stella_en_400M_v5` and differ in prompt specifications (`s2p_query` for queries and `s2s_query` for documents).

2. **Adapter Embeddings**:
   - Adapter embeddings, `li_adapter_embed_prompt` and `li_adapter_embed_document`, are initialized via `LangchainEmbedding`, allowing LlamaIndex to use prompt-specific and document-specific embeddings.

3. **Custom Embedding Classes**:
   - `MyEmbeddingFunctionPrompt`: Custom embedding function for query prompts using `li_adapter_embed_prompt`.
   - `MyEmbeddingFunctionDocument`: Custom embedding function for documents using `li_adapter_embed_document`.
   - These classes extend the `EmbeddingFunction` and customize embeddings based on query types.

## Functions

### `create_rag_pipeline(model_name)`

This function sets up the RAG pipeline for a given `model_name` by embedding documents and saving them in a vector store.

- **Args**:
  - `model_name` (str): Unique identifier for the model, used to create specific paths and directories.

- **Returns**:
  - `dict`: A dictionary containing a success message and the path to the embeddings database, or an error message if the pipeline cannot be created.

- **Process**:
  1. Checks if embeddings have already been created for this model. If so, it returns a message indicating that the RAG pipeline is ready.
  2. If the documents folder (`RAG` folder) does not exist, an error message is returned.
  3. Documents are loaded from the specified directory using `SimpleDirectoryReader`.
  4. A Chroma vector store is created and populated with embeddings for the documents, using the `MyEmbeddingFunctionDocument` function.
  5. The vector store is then indexed, and the embeddings are saved in the Chroma database.

### `query_rag_pipeline(model_name, query)`

This function queries the RAG pipeline with a specified `model_name` and `query`, retrieving relevant responses from the LLM based on stored embeddings.

- **Args**:
  - `model_name` (str): Identifier for the model to locate relevant paths and contexts.
  - `query` (str): Query string used to retrieve context or information from the RAG pipeline.

- **Returns**:
  - `dict`: A dictionary containing the query response results from the LLM.

- **Process**:
  1. Initializes the Chroma database using the specified model path.
  2. Retrieves the `embeddings_db` collection from Chroma.
  3. Sets up a vector store and queries the index using the prompt-specific embedding function (`li_adapter_embed_prompt`).
  4. The LLM executes the query on the indexed embeddings, generating a response based on the most relevant document embeddings.

---

## Directory Structure

- **UPLOADS/**: Directory where the documents are stored and organized by `model_name`.
- **Chroma Database**: The embeddings are saved in a `chroma.sqlite3` file within each `model_name` directory under `UPLOADS`.

## Usage Notes

This code is intended to be part of a larger program. To integrate it:

1. Ensure that document files are uploaded to the `UPLOADS/model_name/RAG` directory.
2. Call `create_rag_pipeline(model_name)` to process and embed documents.
3. Use `query_rag_pipeline(model_name, query)` to retrieve responses based on user queries.

## Requirements

The following packages are required:

- `llama_index`
- `langchain_huggingface`
- `chromadb`

Ensure that the `cuda` device is available for optimal embedding performance, especially if using larger models for embeddings.

---

## Example

```python
# Create the RAG pipeline
response = create_rag_pipeline("my_model")
print(response)

# Query the pipeline
result = query_rag_pipeline("my_model", "What is the content of document X?")
print(result)
```
