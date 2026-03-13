# PROJET - BACKGAMMON CRYPTO

**Nom** : BackgammonCrypto
**Description** : Jeu de backgammon sur blockchain
**Localisation** : /opt/backgammon-crypto/
**Status** : En developpement

---

## ARCHITECTURE

### Stack Technique
- **Backend** : Node.js, TypeScript, FastAPI
- **Blockchain** : Smart contracts (Solidity) - Escrow
- **Frontend** : Next.js
- **Tests** : Jest
- **Package manager** : pnpm

### Structure
```
/opt/backgammon-crypto/
├── src/               → Code source principal
├── backend/           → API et logique serveur
├── contracts/         → Smart contracts Solidity
├── frontend/          → Interface utilisateur (Next.js)
├── docs/              → Documentation
├── scripts/           → Scripts utilitaires
├── tests/             → Tests Jest
├── package.json       → Dependances
├── tsconfig.json      → Config TypeScript
└── jest.config.js     → Config tests
```

## MODELE ECONOMIQUE
- Commission 5% sur les gains
- Frais entree optionnels
- Tournois premium
- Crypto supportees : ETH, USDC, SOL

## BRIEFS
- /tmp/brief_backgammon.md — Concept complet
- /tmp/mission_backgammon.json — Mission originale OpenClaw
