# 🎬 iStream By Web API

[![Firebase](https://img.shields.io/badge/Firebase-Functions-orange?logo=firebase)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Serverless API for on-demand video streaming using Real-Debrid torrent caching and subtitle integration**

[🇵🇹 Versão em Português](#-versão-em-português) | [🇬🇧 English Version](#-english-version)

---

## 🇬🇧 English Version

### 📖 What is this?

**iStream By Web API** is a serverless backend solution built with **Firebase Cloud Functions** that provides on-demand video streaming capabilities. The API leverages Real-Debrid's torrent caching service to convert torrent links into streamable HTTP URLs, and integrates OpenSubtitles API for subtitle searching and downloading.

This project demonstrates modern cloud architecture principles, including:
- ✅ **Serverless computing** with Firebase Functions
- ✅ **RESTful API design** using Express.js
- ✅ **Third-party API integration** (Real-Debrid, OpenSubtitles)
- ✅ **HTTP proxy patterns** for media streaming
- ✅ **Scalable cloud infrastructure** with automatic scaling

### 🎯 What I Built

I developed a complete **streaming proxy API** with the following features:

#### Core Functionality:
1. **Stream Setup Endpoint** (`/stream`)
   - Accepts IMDB IDs and media type (movie/series)
   - Queries Real-Debrid API to find cached torrents
   - Returns streamable video URLs ready for playback

2. **Subtitle Search** (`/subtitles/search`)
   - Searches OpenSubtitles database by IMDB ID
   - Returns available subtitles with language and quality metadata
   
3. **Subtitle Download** (`/subtitles/download`)
   - Fetches subtitle files from OpenSubtitles
   - Handles subtitle format conversion and encoding

4. **Subtitle Proxy** (`/subtitles/proxy`)
   - Proxies subtitle requests to avoid CORS issues
   - Enables seamless subtitle integration in web players

#### Technical Highlights:
- **Modular architecture** with separation of concerns (handlers, routes, config)
- **Error handling** and validation for robust API responses
- **CORS configuration** for cross-origin requests
- **Environment-based configuration** for secure credential management
- **Extended timeout configuration** (180s) for long-running operations

### 🛠️ Technologies Used

#### **Backend & Deployment**
- **[Firebase Functions](https://firebase.google.com/products/functions)** - Serverless compute platform
- **[Node.js 18](https://nodejs.org/)** - JavaScript runtime
- **[Express.js 4.18](https://expressjs.com/)** - Web framework for routing and middleware

#### **HTTP & External APIs**
- **[Axios 1.6](https://axios-http.com/)** - HTTP client for API requests
- **[CORS](https://www.npmjs.com/package/cors)** - Cross-origin resource sharing middleware
- **Real-Debrid API** - Torrent caching and unrestricting service
- **OpenSubtitles API** - Subtitle search and download

#### **Development Tools**
- **[ESLint 8.55](https://eslint.org/)** - Code quality and style enforcement
- **[Firebase CLI](https://firebase.google.com/docs/cli)** - Local development and deployment

### 📂 Project Structure

```
istreambyweb-api/
├── firebase.json              # Firebase configuration
├── .firebaserc                # Firebase project settings
├── functions/
│   ├── index.js              # Main entry point - Express app & routes
│   ├── package.json          # Dependencies and scripts
│   ├── .eslintrc.js          # Linting rules
│   └── handlers/
│       ├── setupStream.js    # Stream setup logic
│       └── subtitles.js      # Subtitle operations
└── README.md
```

### 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stream?imdbId={id}&type={movie\|series}` | Get streaming URL for content |
| `GET` | `/subtitles/search?imdbId={id}` | Search available subtitles |
| `POST` | `/subtitles/download` | Download subtitle file |
| `GET` | `/subtitles/proxy?url={encoded_url}` | Proxy subtitle requests |

### � Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manopipoca111005/istreambyweb-api.git
   cd istreambyweb-api/functions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   ```bash
   firebase login
   firebase use --add
   ```

4. **Set environment variables** (for Real-Debrid API key)
   ```bash
   firebase functions:config:set realdebrid.apikey="YOUR_API_KEY"
   ```

5. **Run locally**
   ```bash
   npm run serve
   ```

6. **Deploy to production**
   ```bash
   npm run deploy
   ```

### � Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Lint** | `npm run lint` | Check code quality with ESLint |
| **Serve** | `npm run serve` | Run functions locally with Firebase emulator |
| **Deploy** | `npm run deploy` | Deploy to Firebase cloud |
| **Shell** | `npm start` | Interactive Firebase Functions shell |

### � Configuration

The API is configured to run in `us-central1` region with:
- **Timeout:** 180 seconds (for large file operations)
- **Runtime:** Node.js 18
- **CORS:** Enabled for all origins

### 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 🇵🇹 Versão em Português

### 📖 O que é isto?

**iStream By Web API** é uma solução backend serverless construída com **Firebase Cloud Functions** que fornece capacidades de streaming de vídeo on-demand. A API utiliza o serviço de cache de torrents do Real-Debrid para converter links torrent em URLs HTTP transmissíveis, e integra a API do OpenSubtitles para pesquisa e download de legendas.

Este projeto demonstra princípios modernos de arquitetura cloud, incluindo:
- ✅ **Computação serverless** com Firebase Functions
- ✅ **Design de API RESTful** usando Express.js
- ✅ **Integração com APIs de terceiros** (Real-Debrid, OpenSubtitles)
- ✅ **Padrões de proxy HTTP** para streaming de mídia
- ✅ **Infraestrutura cloud escalável** com escalonamento automático

### 🎯 O que eu fiz

Desenvolvi uma **API proxy de streaming** completa com as seguintes funcionalidades:

#### Funcionalidades Principais:
1. **Endpoint de Configuração de Stream** (`/stream`)
   - Aceita IDs do IMDB e tipo de mídia (filme/série)
   - Consulta a API do Real-Debrid para encontrar torrents em cache
   - Retorna URLs de vídeo transmissíveis prontos para reprodução

2. **Pesquisa de Legendas** (`/subtitles/search`)
   - Pesquisa na base de dados do OpenSubtitles por ID do IMDB
   - Retorna legendas disponíveis com metadados de idioma e qualidade
   
3. **Download de Legendas** (`/subtitles/download`)
   - Obtém arquivos de legendas do OpenSubtitles
   - Lida com conversão de formato e codificação de legendas

4. **Proxy de Legendas** (`/subtitles/proxy`)
   - Faz proxy de requisições de legendas para evitar problemas de CORS
   - Permite integração perfeita de legendas em players web

#### Destaques Técnicos:
- **Arquitetura modular** com separação de responsabilidades (handlers, rotas, config)
- **Tratamento de erros** e validação para respostas robustas da API
- **Configuração CORS** para requisições cross-origin
- **Configuração baseada em ambiente** para gestão segura de credenciais
- **Configuração de timeout estendido** (180s) para operações de longa duração

### 🛠️ Tecnologias Utilizadas

#### **Backend & Deployment**
- **[Firebase Functions](https://firebase.google.com/products/functions)** - Plataforma de computação serverless
- **[Node.js 18](https://nodejs.org/)** - Runtime JavaScript
- **[Express.js 4.18](https://expressjs.com/)** - Framework web para roteamento e middleware

#### **HTTP & APIs Externas**
- **[Axios 1.6](https://axios-http.com/)** - Cliente HTTP para requisições de API
- **[CORS](https://www.npmjs.com/package/cors)** - Middleware de compartilhamento de recursos entre origens
- **API Real-Debrid** - Serviço de cache de torrents e desbloqueio
- **API OpenSubtitles** - Pesquisa e download de legendas

#### **Ferramentas de Desenvolvimento**
- **[ESLint 8.55](https://eslint.org/)** - Controle de qualidade e estilo de código
- **[Firebase CLI](https://firebase.google.com/docs/cli)** - Desenvolvimento local e deployment

### 📦 Instalação e Configuração

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Manopipoca111005/istreambyweb-api.git
   cd istreambyweb-api/functions
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   ```bash
   firebase login
   firebase use --add
   ```

4. **Defina variáveis de ambiente** (para chave API do Real-Debrid)
   ```bash
   firebase functions:config:set realdebrid.apikey="SUA_CHAVE_API"
   ```

5. **Execute localmente**
   ```bash
   npm run serve
   ```

6. **Faça deploy para produção**
   ```bash
   npm run deploy
   ```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Autor

**Gustavo Ramos**
- GitHub: [@Manopipoca111005](https://github.com/Manopipoca111005)
- Linkdin: [Gustavo Ramos](www.linkedin.com/in/gustavo-ramos-637580265)
- Discord: [883392891161026560](https://discordapp.com/users/883392891161026560)

---

⭐ **If you found this project interesting, please consider giving it a star!**
