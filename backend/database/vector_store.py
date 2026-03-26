import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Store paths
DB_DIR = os.path.dirname(__file__)
FAISS_INDEX_PATH = os.path.join(DB_DIR, "faiss_index.bin")
MAPPING_PATH = os.path.join(DB_DIR, "faiss_mapping.json")

class VectorStore:
    def __init__(self):
        # We use a lightweight but performant sentence transformer for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.vector_dim = self.model.get_sentence_embedding_dimension()
        self.index = None
        self.id_mapping = {}  # Map: faiss_id (int) -> article_id (str)
        self.load()

    def load(self):
        """Loads the FAISS index and the mapping from disk if they exist."""
        if os.path.exists(FAISS_INDEX_PATH):
            self.index = faiss.read_index(FAISS_INDEX_PATH)
        else:
            # Create a new L2 distance index
            self.index = faiss.IndexFlatL2(self.vector_dim)

        if os.path.exists(MAPPING_PATH):
            with open(MAPPING_PATH, 'r') as f:
                # json stores keys as strings, so we convert back to int
                data = json.load(f)
                self.id_mapping = {int(k): v for k, v in data.items()}
        else:
            self.id_mapping = {}

    def save(self):
        """Saves the FAISS index and the id mapping to disk."""
        if self.index is not None:
            faiss.write_index(self.index, FAISS_INDEX_PATH)
        with open(MAPPING_PATH, 'w') as f:
            json.dump(self.id_mapping, f)

    def add_articles(self, articles: list):
        """
        Embeds and adds multiple articles to the FAISS index.
        Articles should be a list of tuples: (article_id, search_text)
        """
        if not articles:
            return

        texts = [text for _, text in articles]
        article_ids = [aid for aid, _ in articles]

        # Generate embeddings
        embeddings = self.model.encode(texts, show_progress_bar=False)
        embeddings = np.array(embeddings).astype('float32')

        # Add to FAISS index
        start_faiss_id = self.index.ntotal
        self.index.add(embeddings)

        # Update mapping
        for i, article_id in enumerate(article_ids):
            self.id_mapping[start_faiss_id + i] = article_id

        # Save to disk
        self.save()
        print(f"  🧠 [VECTOR_STORE]: Successfully embedded {len(articles)} articles into FAISS.")

    def search(self, query: str, top_k: int = 5):
        """
        Searches the FAISS index for the semantically closest vectors.
        Returns a list of article_ids and their distances.
        """
        if self.index.ntotal == 0:
            print("  ⚠️ [VECTOR_STORE]: FAISS index is empty. No semantic matches.")
            return []

        # Ensure top_k doesn't exceed the total index capacity
        top_k = min(top_k, self.index.ntotal)

        # Encode query
        query_embedding = self.model.encode([query], show_progress_bar=False)
        query_embedding = np.array(query_embedding).astype('float32')

        # Run vector search
        distances, indices = self.index.search(query_embedding, top_k)

        # Map FAISS returned indices back to SQLite string IDs
        results = []
        for i in range(top_k):
            faiss_id = int(indices[0][i])
            if faiss_id in self.id_mapping:
                article_id = self.id_mapping[faiss_id]
                dist = float(distances[0][i])
                results.append({"article_id": article_id, "distance": dist})

        return results

# Singleton instance
vector_store = VectorStore()
