from langchain_huggingface import HuggingFaceEmbeddings

_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        print(">>> loading embedding model...")
        _embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
        print(">>> embedding model loaded")
    return _embeddings