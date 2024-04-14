#!/bin/zsh

# Setup configuration
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
VENV_DIR="env"

# Custom ports
REACT_PORT=3006
FLASK_PORT=5006

# Create virtual environment if it doesn't exist
if [[ ! -d "$VENV_DIR" ]]; then
    python3 -m venv $VENV_DIR
    echo "Created virtual environment."
fi

# Activate virtual environment
source $VENV_DIR/bin/activate

# Install backend dependencies if not already installed
cd $BACKEND_DIR
if [[ ! -d "$VENV_DIR/lib/python3.*/site-packages/flask" ]]; then
    pip install -r requirements.txt
    echo "Installed backend dependencies."
else
    echo "Backend dependencies already installed."
fi

# Start Flask server
{ 
    export FLASK_APP=app.py
    export FLASK_ENV=development
    flask run --port=$FLASK_PORT &
} &

cd ..

# Install frontend dependencies if not already installed
cd $FRONTEND_DIR
if [[ ! -d "node_modules" ]]; then
    npm install
    echo "Installed frontend dependencies."
else
    echo "Frontend dependencies already installed."
fi

# Start React development server
{ 
    export PORT=$REACT_PORT
    npm run build-local &
} &

cd ..

# Wait for servers to start
sleep 10

# Launch the React app in the default browser
xdg-open http://localhost:$REACT_PORT &

echo "Both servers are running..."
echo "Flask API on http://localhost:$FLASK_PORT"
echo "React App on http://localhost:$REACT_PORT"