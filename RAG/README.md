# QA-Enhanced Prompt-Driven Knowledge RAG

**QA-Enhanced Prompt-Driven Knowledge RAG** is a Retrieval-Augmented Generation (RAG) system designed to enhance information retrieval from documents, specifically PDFs, by generating question-answer pairs for each page. This system utilizes a language model (LLM) to process documents page-by-page, producing structured Q&A pairs and storing both the Q&A and document content as embeddings in a vector database for efficient querying. This setup is ideal for building applications that require in-depth, contextually accurate responses from long-form documents.

## Key Features

- **Question-Answer Pair Generation**: Automatically generates detailed Q&A pairs for each page, enabling granular retrieval of information.
- **Vectorized Embedding Storage**: Embeds and stores Q&A pairs and document chunks separately, optimizing retrieval precision for varied query types.
- **Cross-Page Context Handling**: Links related chunks and Q&A pairs across pages, enhancing the LLM’s ability to provide contextually accurate answers.

## Table of Contents

- [QA-Enhanced Prompt-Driven Knowledge RAG](#qa-enhanced-prompt-driven-knowledge-rag)
  - [Key Features](#key-features)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Components](#components)
  - [Example](#example)
    - [Sample Output](#sample-output)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/sam-shervin/Custard-Pie.git
   cd RAG
   ```

2. Install the required libraries:

   ```bash
   pip install openai PyPDF2 langchain faiss-cpu
   ```

## Usage

1. **Set Up Ollama**:
   Refer to the [Ollama documentation](https://ollama.com/)

2. **Process a PDF**: Run the `process_pdf()` function to process each page, generate Q&A pairs, and store both Q&A and document chunks in the vector database.

   ```python
   pdf_path = "path/to/your/document.pdf"
   process_pdf(pdf_path)
   ```

3. **Query the Database**: Use the `retrieve_answer()` function to query the vector database with a natural language query, retrieving the most relevant Q&A pairs or document sections.

   ```python
   query = "Explain the main concept on page 5."
   results = retrieve_answer(query)
   ```

## Components

- **PDF Processing**: Uses `PyPDF2` to extract text from each page of a PDF.
- **Q&A Generation**: Sends each page’s text to an LLM (e.g., OpenAI’s GPT-3/4) to generate detailed Q&A pairs.
- **Embedding and Storage**: Utilizes `langchain` with `FAISS` for embedding Q&A pairs and document chunks into a vector store.
- **Similarity Search**: Enables semantic search using vector embeddings, allowing retrieval of the most relevant Q&A or document chunk based on the user’s query.

## Example

```python
# Process and store data from a PDF document
pdf_path = "sample_document.pdf"
process_pdf(pdf_path)

# Query for an answer
query = "What are the main points discussed in the introduction?"
results = retrieve_answer(query)

# Display results
for content, metadata in results:
    print(f"Page {metadata['page']} - {content}")
```

### Sample Output

```bash
Page 1 - Q: What is the purpose of this document?
          A: The purpose of the document is to outline...
Page 1 - Q: Who is the target audience?
          A: This document is intended for...
```

## Contributing

Contributions are welcome! If you have ideas for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
