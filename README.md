# CustardPie

**CustardPie** is an application that customizes Large Language Models (LLMs) based on user preferences. Users can select from a range of pre-trained LLMs, then personalize them further by adding their own documents in formats such as PDFs, `.txt`, and `.docx`. The application processes these inputs, fine-tuning the model as per the specified customizations, and provides the modified model file for download.

---

## Features

- **LLM Customization**: *(Work in progress)* Users can select their preferred LLM model type.
- **Document & Website Integration**: Upload documents in `.pdf`, `.txt`, or `.docx` formats or specify websites for model tuning.
- **Personalized Model Output**: *(Work in progress)* Receive a tailored LLM file based on the provided customizations.

---

## Prerequisites

Ensure you have the following installed:

- Node.js (v20 or above)
- Python (v3.10 recommended)
- `pnpm`/`yarn`/`npm` (use any based on your preference)

---

## Installation

Clone the repository and navigate to the `ui` directory to install dependencies.

```bash
cd ui
pnpm install
```

### Running the Application

1. **Backend**:

   ```bash
   pnpm run server
   ```

2. **Frontend**:

   ```bash
   pnpm run dev
   ```

---

## Python Dependencies

To install the required Python packages, run:

```bash
pip install -r requirements.txt
```

### `requirements.txt`

```plaintext
chromadb
langchain-huggingface
llama-index-llms-ollama
llama-index-vector-stores-chroma
llama-index-embeddings-langchain
llama-index
langchain
langchain-community
Flask
```

---

## Usage

1. Launch the backend and frontend servers.
2. Access the application from your browser.
3. Choose your preferred LLM model type ***(Work in progress)***.
4. Upload your documents in `.pdf`, `.txt`, or `.docx` formats.
5. Download your customized LLM model ***(Work in progress)***.

---
