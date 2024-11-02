from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
import os
from llama_index.llms.ollama import Ollama
from langchain_huggingface import HuggingFaceEmbeddings
from llama_index.embeddings.langchain import LangchainEmbedding
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext
from llama_index.core import PromptTemplate
from llama_index.core.query_engine import CustomQueryEngine
from llama_index.core.retrievers import BaseRetriever
from llama_index.core import get_response_synthesizer
from llama_index.core.response_synthesizers import BaseSynthesizer
from llama_index.core.retrievers import VectorIndexRetriever
from chromadb import Documents, EmbeddingFunction, Embeddings
from llama_index.readers.chroma import ChromaReader

llm = Ollama(model="llama3.2", request_timeout=420)

qa_prompt = PromptTemplate(
    "Context information is below.\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "Given the context information and not prior knowledge, "
    "answer the query.\n"
    "Query: {query_str}\n"
    "Answer: "
)

class RAGStringQueryEngine(CustomQueryEngine):
    """RAG String Query Engine."""

    retriever: BaseRetriever
    response_synthesizer: BaseSynthesizer
    llm: Ollama
    qa_prompt: PromptTemplate

    def custom_query(self, query_str: str):
        print("custom query")
        nodes = self.retriever.retrieve(query_str)
        print("this ran")

        context_str = "\n\n".join([n.node.get_content() for n in nodes])
        print(self.llm)
        response = self.llm.complete(
            qa_prompt.format(context_str=context_str, query_str=query_str)
        )
        print(response)

        return str(response)

lc_embed_model = HuggingFaceEmbeddings(model_name="dunzhang/stella_en_400M_v5", model_kwargs={"trust_remote_code":True, "device": "cuda"}, encode_kwargs={"prompt_name": "s2p_query"})
li_adapter_embed = LangchainEmbedding(lc_embed_model)


class MyEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        embeddings = li_adapter_embed.get_text_embedding(input)
        embeddings_as_list = [embedding.tolist() for embedding in embeddings]
        print(embeddings_as_list)
        # embed the documents somehow
        return embeddings_as_list


def create_rag_pipeline(model_name):
    # Define paths
    base_path = os.path.join("UPLOADS", model_name)
    rag_folder = os.path.join(base_path, "RAG")
    embeddings_db_path = os.path.join(base_path, "embeddings_db.json")

    if not os.path.exists(rag_folder):
        if os.path.exists(os.path.join(base_path, "embeddings.json")):
            return {"message": "RAG pipeline already created", "embeddings_db_path": embeddings_db_path}
        else:
            return {"error": "No files uploaded"}, 400

    # Read documents from the RAG folder
    print("reading documents from rag folder")
    documents = SimpleDirectoryReader(rag_folder, recursive=True, exclude_hidden=True).load_data(show_progress=True)

    # Initialize the vector store and index the documents
    db = chromadb.PersistentClient(path=base_path)
    chroma_collection = db.get_or_create_collection("embeddings_db", embedding_function=MyEmbeddingFunction())
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, embed_model=li_adapter_embed, show_progress=True)
    

    # Create the RAG pipeline
    #index = GPTSimpleVectorIndex(documents, embed_model=model, embed_tokenizer=tokenizer)
    #print(index)
    # once the index is created, delete the the RAG folder
    #os.rmdir(rag_folder)
    # Save the embeddings database
    #index.save_to_disk(embeddings_db_path)

    return {"message": "RAG pipeline created and embeddings saved", "embeddings_db_path": embeddings_db_path}

def query_rag_pipeline(model_name, query):
    print("llm", llm)
    # Define paths
    base_path = os.path.join("UPLOADS", model_name)

    '''reader = ChromaReader(
    collection_name="embeddings_db",
    persist_directory=base_path,)

    query_vector = li_adapter_embed.get_query_embedding(query)

    documents = reader.load_data(query_embedding=query_vector, limit=5)
    print(documents)'''

    db = chromadb.PersistentClient(path=base_path)
    chroma_collection = db.get_or_create_collection("embeddings_db")
    '''results = chroma_collection.query(
    query_texts=[query],
    n_results=1,
    query_embeddings=li_adapter_embed.get_query_embedding(query),
    )
    print(results)'''
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    print(vector_store)
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        embed_model=li_adapter_embed,
    )
    query_engine = index.as_query_engine(llm=llm)
    response = query_engine.query(query)


    '''print(index)
    retriever = index.as_retriever(
    similarity_top_k=3
    )#VectorIndexRetriever(index=index, vector_store_query_mode="sparse")
    print(retriever)
    #response_synthesizer = get_response_synthesizer(response_mode="compact", llm=Ollama(model="llama3.2", device="cuda"))
    
    print("before")
    
    """qe = RAGStringQueryEngine(
        retriever=retriever,
        response_synthesizer=response_synthesizer,
        llm=Ollama(model="llama3.2", device="cuda"),
        qa_prompt=qa_prompt,
    )
    
    # Perform the query"""
    response = retriever.retrieve(query)
    print(response)'''


    return {"results": response.response}

def query_LLM_pipeline(model_name, query):
    print("querying LLM pipeline")
    query_from_RAG = query_rag_pipeline(model_name, query)
    print(query_from_RAG)
    return query_from_RAG["results"]

if __name__ == "__main__":
    model_name = "Astro"
    #create_rag_pipeline(model_name)
    query = "What is the capital of France?"
    results = query_rag_pipeline(model_name, query)
    print(results)
