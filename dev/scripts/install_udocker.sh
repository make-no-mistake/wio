#!/bin/bash

# Configuration
UDOCKER_VER="1.3.17"
TAR_FILE="udocker-${UDOCKER_VER}.tar.gz"
URL="https://github.com/indigo-dc/udocker/releases/download/${UDOCKER_VER}/${TAR_FILE}"
INSTALL_DIR=$(pwd)
UDOCKER_BIN="${INSTALL_DIR}/udocker-${UDOCKER_VER}/udocker"
BASHRC="$HOME/.bashrc"

echo "=========================================="
echo "   📦 Installing udocker ${UDOCKER_VER}   "
echo "=========================================="

# 1. Download and Extract
if [ -d "${INSTALL_DIR}/udocker-${UDOCKER_VER}" ]; then
    echo "✅ udocker folder already exists. Skipping download."
else
    echo "⬇️  Downloading udocker..."
    wget -q --show-progress "$URL"

    echo "📂 Extracting..."
    tar zxf "$TAR_FILE"
    
    echo "🧹 Cleaning up..."
    rm "$TAR_FILE"
fi

# 2. Configure .bashrc
echo "📝 Updating ${BASHRC}..."

# Helper function to append only if missing
add_line() {
    local LINE="$1"
    if ! grep -Fxq "$LINE" "$BASHRC"; then
        echo "$LINE" >> "$BASHRC"
        echo "   + Added: $LINE"
    else
        echo "   . Skiping: $LINE (Already exists)"
    fi
}

# --- A. Alias python=python3 ---
add_line "alias python=python3"

# --- B. Export local bin ---
add_line "export PATH=\$HOME/.local/bin:\$PATH"

# --- C. Export udocker PATH (Using absolute path) ---
add_line "export PATH=${UDOCKER_BIN}:\$PATH"

# --- D. Alias udocker executable (Using absolute path) ---
add_line "alias udocker=${UDOCKER_BIN}/udocker"

echo ""
echo "✅ Installation Complete!"
echo "=========================================="
echo "👉 IMPORTANT: Run this command to start using udocker:"
echo ""
echo "    source ~/.bashrc"
echo ""
echo "=========================================="
