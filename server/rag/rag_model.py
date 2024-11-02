import os
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext
from llama_index.embeddings.langchain import LangchainEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.llms.ollama import Ollama
from langchain_huggingface import HuggingFaceEmbeddings
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings

# Initialize the large language model (LLM)
llm = Ollama(model="llama3.2", request_timeout=420)

# Embedding models for Langchain with prompt-specific embeddings
lc_embed_model_prompt = HuggingFaceEmbeddings(
    model_name="dunzhang/stella_en_400M_v5",
    model_kwargs={"trust_remote_code": True, "device": "cuda"},
    encode_kwargs={"prompt_name": "s2p_query"}
)

# Adapter embeddings for LlamaIndex
li_adapter_embed_prompt = LangchainEmbedding(lc_embed_model_prompt)


class MyEmbeddingFunctionPrompt(EmbeddingFunction):
    """
    Custom embedding function to process query prompts using Langchain's HuggingFaceEmbeddings.
    """

    def __call__(self, input: Documents) -> Embeddings:
        return [embedding.tolist() for embedding in li_adapter_embed_prompt.get_text_embedding(input)]


def create_rag_pipeline(model_name):
    """
    Creates a Retrieval-Augmented Generation (RAG) pipeline by reading and embedding documents,
    saving them in a vector store.

    Args:
        model_name (str): Unique identifier for the model's directory and files.

    Returns:
        dict: Message indicating success or error with the path to the embeddings database.
    """
    base_path = os.path.join("UPLOADS", model_name)
    rag_folder = os.path.join(base_path, "RAG")
    embeddings_db_path = os.path.join(base_path, "chroma.sqlite3")

    # Check if embeddings are already created
    if os.path.exists(embeddings_db_path):
        return {"message": "RAG pipeline already created", "embeddings_db_path": embeddings_db_path}
    elif not os.path.exists(rag_folder):
        return {"error": "No files uploaded"}, 400

    # Load documents for embedding
    documents = SimpleDirectoryReader(
        rag_folder, recursive=True, exclude_hidden=True).load_data(show_progress=True)

    # Set up Chroma database and index documents
    db = chromadb.PersistentClient(path=base_path)
    chroma_collection = db.create_collection(
        "embeddings_db", embedding_function=MyEmbeddingFunctionPrompt())
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    VectorStoreIndex.from_documents(
        documents, storage_context=storage_context, embed_model=li_adapter_embed_prompt, show_progress=True)

    return {"message": "RAG pipeline created and embeddings saved", "embeddings_db_path": embeddings_db_path}


def query_rag_pipeline(model_name, query):
    """
    Queries the RAG pipeline using a provided query, retrieving relevant information.

    Args:
        model_name (str): Identifier for the model directory and files.
        query (str): Query string to retrieve context.

    Returns:
        dict: Dictionary containing the response results from the LLM.
    """

    # Check if embeddings are already created

    base_path = os.path.join("UPLOADS", model_name)
    embeddings_db_path = os.path.join(base_path, "chroma.sqlite3")
    if os.path.exists(embeddings_db_path):
        db = chromadb.PersistentClient(path=base_path)
        chroma_collection = db.get_collection("embeddings_db")
    else:
        return {"error": "RAG pipeline not created"}, 400

    # Set up vector store and query the index
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        embed_model=li_adapter_embed_prompt,
    )

    # Execute the query using the LLM and return the response
    query_engine = index.as_query_engine(llm=llm)
    response = query_engine.query(query)
    return response.response
