import os
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, PromptTemplate
from llama_index.embeddings.langchain import LangchainEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.llms.ollama import Ollama
from langchain_huggingface import HuggingFaceEmbeddings
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings

# Initialize LLM
llm = Ollama(model="llama3.2", request_timeout=420)


class MyEmbeddingFunction(EmbeddingFunction):
    """Custom embedding function using Langchain's HuggingFaceEmbeddings."""
    def __call__(self, input: Documents) -> Embeddings:
        embeddings = li_adapter_embed.get_text_embedding(input)
        return [embedding.tolist() for embedding in embeddings]

# Embedding model
lc_embed_model = HuggingFaceEmbeddings(model_name="dunzhang/stella_en_400M_v5", model_kwargs={"trust_remote_code":True, "device": "cuda"}, encode_kwargs={"prompt_name": "s2p_query"})
li_adapter_embed = LangchainEmbedding(lc_embed_model)


def create_rag_pipeline(model_name):
    """
    Creates a Retrieval-Augmented Generation (RAG) pipeline by reading documents,
    embedding them into a vector store, and saving the embeddings database.

    Parameters:
        model_name (str): Name of the model for creating directories and paths.

    Returns:
        dict: Message with path to the embeddings database or an error message.
    """
    base_path = os.path.join("UPLOADS", model_name)
    rag_folder = os.path.join(base_path, "RAG")
    embeddings_db_path = os.path.join(base_path, "embeddings_db.json")

    if not os.path.exists(rag_folder):
        if os.path.exists(os.path.join(base_path, "embeddings.json")):
            return {"message": "RAG pipeline already created", "embeddings_db_path": embeddings_db_path}
        else:
            return {"error": "No files uploaded"}, 400

    # Read documents and load data
    documents = SimpleDirectoryReader(rag_folder, recursive=True, exclude_hidden=True).load_data(show_progress=True)

    # Initialize the vector store and index the documents
    db = chromadb.PersistentClient(path=base_path)
    chroma_collection = db.get_or_create_collection("embeddings_db", embedding_function=MyEmbeddingFunction())
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=li_adapter_embed, show_progress=True)

    return {"message": "RAG pipeline created and embeddings saved", "embeddings_db_path": embeddings_db_path}


def query_rag_pipeline(model_name, query):
    """
    Queries the RAG pipeline with a given query and returns results.

    Parameters:
        model_name (str): Model name to retrieve paths and context.
        query (str): Query string for the pipeline.

    Returns:
        dict: Dictionary containing the response results.
    """
    base_path = os.path.join("UPLOADS", model_name)
    db = chromadb.PersistentClient(path=base_path)
    chroma_collection = db.get_or_create_collection("embeddings_db")
    
    # Set up vector store and index for querying
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        embed_model=li_adapter_embed,
    )

    # Query engine for the pipeline
    query_engine = index.as_query_engine(llm=llm)
    response = query_engine.query(query)
    return {"results": response.response}


def query_LLM_pipeline(model_name, query):
    """
    Wrapper function to query the LLM pipeline directly.

    Parameters:
        model_name (str): Model name used in the pipeline.
        query (str): Query string for querying the pipeline.

    Returns:
        str: Response from the RAG pipeline query.
    """
    query_from_RAG = query_rag_pipeline(model_name, query)
    return query_from_RAG["results"]

if __name__ == "__main__":
    model_name = "Astro"
    query = "What is the capital of France?"
    results = query_rag_pipeline(model_name, query)
    print(results)
