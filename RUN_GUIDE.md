# 🚀 How to Run "NewsMind AI — The Personalized Newsroom"

Follow these instructions to get both the backend and frontend up and running on your Windows machine.

---

### **1. Setup Backend (FastAPI)**
The backend handles AI processing, news retrieval, and data synthesis.

1. Open a **new terminal** (PowerShell or Command Prompt) in the project root: `c:\Users\acer\Documents\myet-ai-newsroom(1)\myet-ai-newsroom`
2. **Activate the Virtual Environment**:
   ```powershell
   .\venv\Scripts\activate
   ```
3. **Install Dependencies** (if you haven't already):
   ```powershell
   pip install -r requirements.txt
   ```
4. **Start the Backend Server**:
   ```powershell
   uvicorn backend.main:app --reload
   ```
   *The backend will be live at: `http://localhost:8000`*

---

### **2. Setup Frontend (React + Vite)**
The frontend provides the modern intelligence dashboard interface.

1. Open a **second terminal** window in the project root.
2. **Navigate to the frontend folder**:
   ```powershell
   cd frontend
   ```
3. **Install Dependencies** (if you haven't already):
   ```powershell
   npm install
   ```
4. **Start the Development Server**:
   ```powershell
   npm run dev
   ```
   *The frontend will be live at: `http://localhost:5173`*

---

### **💡 Quick Notes**
*   **Stay Running**: You must keep **both** terminal windows open while using the app.
*   **Dashboard Access**: Once both are running, open your browser to `http://localhost:5173`.
*   **Dynamic Role Play**: Use the dropdown in the top navbar to switch roles (Student, Investor, etc.) and watch the AI instantly rewrite the intelligence report!
