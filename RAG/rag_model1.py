from llama_index.core import SimpleDirectoryReader
from transformers import AutoTokenizer, AutoModel, AutoConfig
from sentence_transformers import SentenceTransformer
import os
# use ollama for llm through llamaindex
from llama_index.llms.ollama import Ollama

def create_rag_pipeline(model_name):
    # Define paths
    base_path = os.path.join("../UPLOADS", model_name)
    rag_folder = os.path.join(base_path, "RAG")
    embeddings_db_path = os.path.join(base_path, "embeddings_db.json")

    # Ensure the RAG folder exists
    #if not os.path.exists(rag_folder):
        #raise FileNotFoundError(f"RAG folder not found for model: {model_name}")

    # Load the embedding model
    model = SentenceTransformer("dunzhang/stella_en_400M_v5", trust_remote_code=True).cuda()

    # Read documents from the RAG folder
    documents = SimpleDirectoryReader(rag_folder, recursive=True, exclude_hidden=True).load_data()
    print(documents)
    print(len(documents))
    # Create the RAG pipeline
    #index = GPTSimpleVectorIndex(documents, embed_model=model, embed_tokenizer=tokenizer)
    #print(index)
    # once the index is created, delete the the RAG folder
    #os.rmdir(rag_folder)
    # Save the embeddings database
    #index.save_to_disk(embeddings_db_path)

    return {"message": "RAG pipeline created and embeddings saved", "embeddings_db_path": embeddings_db_path}

def query_rag_pipeline(model_name, query):
    model = SentenceTransformer("dunzhang/stella_en_400M_v5", trust_remote_code=True).cuda()
    # Define paths
    base_path = os.path.join("../UPLOADS", model_name)
    embeddings_db_path = os.path.join(base_path, "embeddings_db.json")

    # Load the RAG pipeline
    #index = GPTSimpleVectorIndex.load_from_disk(embeddings_db_path)

    # Perform a query
    #results = index.query(query)

    return {"results": " "}

def query_LLM_pipeline(model_name, query):
    llm = Ollama(model="llama3.2", device="cuda")
    #query_from_RAG = query_rag_pipeline(model_name, query)
    resp = llm.complete(f"Based on the following question from the user:\n {query}, \n\n answer from this RAG contexts: \n")
    print(resp)
    return resp.text

if __name__ == "__main__":
    model_name = "my_model"
    create_rag_pipeline(model_name)
    query = "What is the capital of France?"
    results = query_rag_pipeline(model_name, query)
    print(results)
