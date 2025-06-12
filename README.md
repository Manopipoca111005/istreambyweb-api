# Firebase Functions - Stream API

Este projeto implementa duas Cloud Functions para processar e servir vídeos usando Real-Debrid e fontes torrent. Utiliza o Express.js e o Firebase Functions como backend sem escutar nenhuma porta manualmente.

## 🚀 Funcionalidades

- `/setup-stream/:type/:imdbId` - Prepara o stream usando Real-Debrid
- `/stream/:identifier` - Faz proxy para o link final do vídeo

## 📂 Estrutura do Projeto

```
project-root/
├── firebase.json
└── functions/
    ├── .eslintrc.js
    ├── index.js
    ├── package.json
    └── handlers/
        ├── setupStream.js
        └── streamProxy.js
```

## 📁 Instalação

1. Clone o repositório:

```bash
git clone <repo-url>
cd project-root/functions
```

2. Instale as dependências:

```bash
npm install
```

## 🔧 Scripts Disponíveis

- `npm run lint` - Verifica a qualidade do código com ESLint (estilo 2018)
- `npm run serve` - Executa as funções localmente usando o emulador do Firebase
- `npm run deploy` - Faz o deploy para o Firebase

## 🚩 Erro Comum: `functions.runWith is not a function`

Esse erro ocorre quando você está usando uma versão incompatível do pacote `firebase-functions`.

**Solução:**

No `functions/package.json`, garanta que a versão seja:

```json
"firebase-functions": "^4.4.0"
```

Então reinstale:

```bash
npm install
```

Se continuar com problema, tente com:

```bash
npm install firebase-functions@latest firebase-admin@latest
```

## ✨ Deploy para Firebase

1. Certifique-se de que você fez login no Firebase:

```bash
firebase login
```

2. Depois, execute:

```bash
firebase deploy --only functions
```

---

Se quiser configurar variáveis de ambiente para proteger seu token do Real-Debrid, posso ajudar a configurar isso com `functions.config()`. Deseja que eu inclua isso também?
