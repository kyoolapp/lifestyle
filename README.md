

  # Lifestyle Health App

  This is a code bundle for Lifestyle Health App. The original project is available at https://www.figma.com/design/NxCcZJGdbdL6l2vKCKcbFp/Lifestyle-Health-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
## Running the backend (FastAPI)

1. Open a terminal in the `backend` directory.
2. (Optional) Activate the Python virtual environment:
  ```powershell
  .venv\Scripts\activate
  ```
3. Install dependencies (if not done):
  ```powershell
  pip install -r requirements.txt
  ```
4. Run the backend server:
  - From the `backend` directory:
    ```powershell
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
  - Or from the `backend/app` directory:
    ```powershell
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
5. Access the API docs at [http://localhost:8000/docs](http://localhost:8000/docs)


  
## Shutting down the backend

To properly stop the backend server:

1. Press `Ctrl+C` in the terminal where the backend is running. This will gracefully stop the FastAPI server.
2. If you activated the virtual environment, you can deactivate it by running:
  ```powershell
  deactivate
  ```
