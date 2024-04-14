@echo off
setlocal

:: Setup configuration
set FRONTEND_DIR=frontend
set BACKEND_DIR=backend
set VENV_DIR=venv

:: Custom ports
set REACT_PORT=3006
set FLASK_PORT=5006

:: Create virtual environment if it doesn't exist
if not exist "%VENV_DIR%" (
    python -m venv %VENV_DIR%
    echo Created virtual environment.
)

:: Activate virtual environment
call %VENV_DIR%\Scripts\activate

:: Install backend dependencies if not already installed
cd %BACKEND_DIR%
if not exist "%VENV_DIR%\lib\site-packages\flask" (
    pip install -r requirements.txt
    echo Installed backend dependencies.
) else (
    echo Backend dependencies already installed.
)

:: Start Flask server
start cmd /k "set FLASK_APP=app.py & set FLASK_ENV=development & flask run --port=%FLASK_PORT%"

cd ..

:: Install frontend dependencies if not already installed
cd %FRONTEND_DIR%
if not exist "node_modules" (
    npm install
    echo Installed frontend dependencies.
) else (
    echo Frontend dependencies already installed.
)

:: Start React development server
start cmd /k "set PORT=%REACT_PORT% & npm run build-local"

cd ..

:: Wait for servers to start
timeout /t 10

:: Launch the React app in the default browser
start http://localhost:%REACT_PORT%

echo Both servers are running...
echo Flask API on http://localhost:%FLASK_PORT%
echo React App on http://localhost:%REACT_PORT%

:end
endlocal
