#!/usr/bin/env bash
set -e

# ==============================================================================
# KODA AI Coding Agent CLI Installer
# One-line install script for Linux & macOS
# ==============================================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "  _  _____  ____    _        ____ _     ___ "
echo " | |/ / _ \|  _ \  / \      / ___| |   |_ _|"
echo " | ' / | | | | | |/ _ \    | |   | |    | | "
echo " | . \ |_| | |_| / ___ \   | |___| |___ | | "
echo " |_|\_\___/|____/_/   \_\   \____|_____|___|"
echo " Autonomous AI Coding Agent — Spec-Driven Dev"
echo -e "${NC}"

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}Error: Node.js belum terpasang.${NC}"
    echo "Silakan install Node.js (v18 atau lebih baru) melalui:"
    echo "  https://nodejs.org atau via NVM: 'nvm install 20'"
    exit 1
fi

NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${YELLOW}Peringatan: Versi Node.js Anda ($(node -v)) di bawah v18. Direkomendasikan v18+.${NC}"
fi

# 2. Determine source directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

if [ -f "$SCRIPT_DIR/package.json" ] && [ -f "$SCRIPT_DIR/src/bin/koda.ts" ]; then
    CLI_DIR="$SCRIPT_DIR"
    echo -e "${GREEN}✓ Terdeteksi direktori lokal:${NC} $CLI_DIR"
else
    # Remote install target
    CLI_DIR="$HOME/.koda/agent-cli"
    echo -e "${CYAN}Mengunduh KODA CLI ke${NC} $CLI_DIR..."
    mkdir -p "$HOME/.koda"
    if [ -d "$CLI_DIR/.git" ]; then
        git -C "$CLI_DIR" pull --quiet
    else
        git clone --depth 1 https://github.com/okkata/ai-tools.git "$HOME/.koda/temp-repo"
        mv "$HOME/.koda/temp-repo/cli" "$CLI_DIR"
        rm -rf "$HOME/.koda/temp-repo"
    fi
fi

# 3. Build & Compile CLI
echo -e "${CYAN}Mengompilasi source code TypeScript...${NC}"
cd "$CLI_DIR"

if [ ! -d "node_modules" ]; then
    npm install --quiet
fi

npm run build --quiet

TARGET_BIN="$CLI_DIR/dist/bin/koda.js"
chmod +x "$TARGET_BIN"

# 4. Link binary to ~/.local/bin/koda
ln -sf "$TARGET_BIN" "$BIN_DIR/koda"

echo -e "${GREEN}✓ Binary 'koda' berhasil di-link ke${NC} $BIN_DIR/koda"

# 5. Check PATH
PATH_INCLUDED=false
case ":$PATH:" in
    *":$BIN_DIR:"*) PATH_INCLUDED=true ;;
esac

if [ "$PATH_INCLUDED" = false ]; then
    SHELL_CONFIG=""
    if [ -n "$ZSH_VERSION" ] || [ "$SHELL" = "/bin/zsh" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ] || [ "$SHELL" = "/bin/bash" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
    fi

    if [ -n "$SHELL_CONFIG" ]; then
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$SHELL_CONFIG"
        echo -e "${YELLOW}✓ Menambahkan ~/.local/bin ke PATH di $SHELL_CONFIG${NC}"
        echo -e "${YELLOW}  Jalankan 'source $SHELL_CONFIG' atau buka terminal baru untuk menyegarkan PATH.${NC}"
    else
        echo -e "${YELLOW}Tambahkan baris berikut ke shell config Anda (~/.bashrc atau ~/.zshrc):${NC}"
        echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    fi
fi

# 6. Verify Installation
echo ""
echo -e "${GREEN}${BOLD}🎉 Instalasi KODA CLI Berhasil!${NC}"
echo ""
echo -e "${BOLD}Mulai menggunakan KODA CLI:${NC}"
echo -e "  1. ${CYAN}koda login${NC}        -> Masuk via Google di browser"
echo -e "  2. ${CYAN}koda doctor${NC}       -> Periksa status akun & provider AI"
echo -e "  3. ${CYAN}koda link <id>${NC}    -> Hubungkan proyek coding dengan dokumen PRD"
echo -e "  4. ${CYAN}koda${NC}              -> Mulai sesi agentic coding interaktif"
echo ""
