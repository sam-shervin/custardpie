from server.rag.rag_model import query_rag_pipeline, create_rag_pipeline

create_rag_pipeline("Astro")

model_name = "Astro"
#create_rag_pipeline(model_name)
query = "What is the capital of France?"
results = query_rag_pipeline(model_name, query)
print(results)