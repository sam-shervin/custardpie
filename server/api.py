# FILE: api.py
from flask import Flask, request, jsonify
import os
from rag.rag_model import create_rag_pipeline, query_rag_pipeline

# Define constants for upload folders
UPLOADS_FOLDER = "uploads"
RAG_UPLOADS_FOLDER = "rag"
FINETUNE_UPLOADS_FOLDER = "finetune"

app = Flask(__name__)

# Ensure the main upload folder exists at startup
os.makedirs(UPLOADS_FOLDER, exist_ok=True)


@app.after_request
def add_cors_headers(response):
    """
    Adds CORS headers to allow cross-origin requests from specified frontend.
    """
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.route('/upload', methods=['POST'])
def upload_files():
    """
    Handles file uploads for RAG and fine-tuning. 
    Creates directories if they do not exist and saves uploaded files.
    """
    model_name = request.form.get('modelName')
    if not model_name:
        return jsonify({"error": "Model name is required"}), 400

    # Prepare model-specific directories
    model_folder = os.path.join(UPLOADS_FOLDER, model_name)
    rag_folder = os.path.join(model_folder, RAG_UPLOADS_FOLDER)
    finetune_folder = os.path.join(model_folder, FINETUNE_UPLOADS_FOLDER)

    for folder in [model_folder, rag_folder, finetune_folder]:
        os.makedirs(folder, exist_ok=True)

    if 'ragFiles' not in request.files and 'fineTuneFiles' not in request.files:
        return jsonify({"error": "No files part in the request"}), 400

    # Collect and validate uploaded files
    rag_files = request.files.getlist('ragFiles')
    fine_tune_files = request.files.getlist('fineTuneFiles')
    if not rag_files and not fine_tune_files:
        return jsonify({"error": "No files uploaded"}), 400

    # Save files to respective folders and collect filenames
    uploaded_files = {"ragFiles": [], "fineTuneFiles": []}

    def save_file(file, folder):
        """Helper function to save files to the specified folder."""
        file_path = os.path.join(folder, file.filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        file.save(file_path)
        return file.filename

    uploaded_files["ragFiles"] = [
        save_file(file, rag_folder) for file in rag_files if file]
    uploaded_files["fineTuneFiles"] = [
        save_file(file, finetune_folder) for file in fine_tune_files if file]

    # Initialize the RAG pipeline
    create_rag_pipeline(model_name)
    return jsonify({"uploaded_files": uploaded_files, "RAG Pipeline ready": True}), 200


@app.route('/models', methods=['GET'])
def get_models():
    """
    Lists all models by checking the upload directory for folders.
    """
    models = [model_name for model_name in os.listdir(UPLOADS_FOLDER)
              if os.path.isdir(os.path.join(UPLOADS_FOLDER, model_name))]
    return jsonify({"models": models}), 200


@app.route('/rag', methods=['POST'])
def rag_algorithm():
    """
    Runs the RAG algorithm on the specified model and query.
    """
    data = request.get_json()
    model_name = data.get('model_name')
    query = data.get('query')

    if not model_name or not query:
        return jsonify({"error": "Model name and query are required"}), 400

    try:
        result = query_rag_pipeline(model_name, query)
        return jsonify({"results": result}), 200
    except FileNotFoundError as e:
        app.logger.error(f"FileNotFoundError: {e}")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        app.logger.error(f"Exception: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/finetune/<model_name>', methods=['POST'])
def finetune_algorithm(model_name):
    """
    Endpoint to handle fine-tuning process for a specified model.
    Placeholder functionality for now.
    """
    finetune_folder = os.path.join(
        UPLOADS_FOLDER, model_name, FINETUNE_UPLOADS_FOLDER)
    if not os.path.exists(finetune_folder):
        return jsonify({"error": "Fine-tune folder not found"}), 404
    # Implement Fine-tune algorithm here
    return jsonify({"message": "Fine-tune algorithm executed"}), 200


if __name__ == '__main__':
    app.run(debug=False)
