from flask import Flask, request, jsonify
import os
import logging
from RAG.rag_model1 import create_rag_pipeline, query_LLM_pipeline

UPLOADS_FOLDER = "./UPLOADS"
RAG_UPLOADS_FOLDER = "RAG"
FINETUNE_UPLOADS_FOLDER = "FineTune"

app = Flask(__name__)

# Ensure the upload folder exists
if not os.path.exists(UPLOADS_FOLDER):
    os.makedirs(UPLOADS_FOLDER)

# Allow cors for localhost:5173
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route('/upload', methods=['POST'])
def upload_files():
    model_name = request.form.get('modelName')
    if not model_name:
        return jsonify({"error": "Model name is required"}), 400

    model_folder = os.path.join(UPLOADS_FOLDER, model_name)
    rag_folder = os.path.join(model_folder, RAG_UPLOADS_FOLDER)
    finetune_folder = os.path.join(model_folder, FINETUNE_UPLOADS_FOLDER)

    if not os.path.exists(model_folder):
        os.makedirs(model_folder)
    if not os.path.exists(rag_folder):
        os.makedirs(rag_folder)
    if not os.path.exists(finetune_folder):
        os.makedirs(finetune_folder)

    if 'ragFiles' not in request.files and 'fineTuneFiles' not in request.files:
        return jsonify({"error": "No files part in the request"}), 400

    rag_files = request.files.getlist('ragFiles')
    fine_tune_files = request.files.getlist('fineTuneFiles')

    if not rag_files and not fine_tune_files:
        return jsonify({"error": "No files uploaded"}), 400

    uploaded_files = {
        "ragFiles": [],
        "fineTuneFiles": []
    }

    def save_file(file, folder):
        file_path = os.path.join(folder, file.filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        file.save(file_path)
        return file.filename

    # Save RAG files
    for file in rag_files:
        if file:
            uploaded_files["ragFiles"].append(save_file(file, rag_folder))

    # Save Fine-tune files
    for file in fine_tune_files:
        if file:
            uploaded_files["fineTuneFiles"].append(save_file(file, finetune_folder))
    create_rag_pipeline(model_name)

    return jsonify({"uploaded_files": uploaded_files, "RAG Pipeline ready": True}), 200

@app.route('/models', methods=['GET'])
def get_models():
    models = []
    for model_name in os.listdir(UPLOADS_FOLDER):
        model_path = os.path.join(UPLOADS_FOLDER, model_name)
        if os.path.isdir(model_path):
            models.append(model_name)
    return jsonify({"models": models}), 200

@app.route('/rag', methods=['POST'])
def rag_algorithm():
    try:
        data = request.get_json()
        model_name = data.get('model_name')
        query = data.get('query')

        if not model_name or not query:
            return jsonify({"error": "Model name and query are required"}), 400

        result = query_LLM_pipeline(model_name, query)
        return jsonify({"results" :result}), 200
    except FileNotFoundError as e:
        app.logger.error(f"FileNotFoundError: {e}")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        app.logger.error(f"Exception: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/finetune/<model_name>', methods=['POST'])
def finetune_algorithm(model_name):
    # Placeholder for Fine-tune algorithm implementation
    finetune_folder = os.path.join(UPLOADS_FOLDER, model_name, FINETUNE_UPLOADS_FOLDER)
    if not os.path.exists(finetune_folder):
        return jsonify({"error": "Fine-tune folder not found"}), 404
    # Implement Fine-tune algorithm here
    return jsonify({"message": "Fine-tune algorithm executed"}), 200

if __name__ == '__main__':
    # Configure logging
    #logging.basicConfig(level=logging.DEBUG)
    app.config['DEBUG'] = True
    app.config['PROPAGATE_EXCEPTIONS'] = True
    app.run(debug=True)