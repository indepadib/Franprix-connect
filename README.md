# 🏪 Franprix Connect Pro-Max — Guide d'intégration

Ce projet est une application de fidélité haute fidélité connectée à **Microsoft Dynamics 365** et supportant l'intégration **Apple Wallet**.

---

## 🏗️ Architecture Technique
- **Frontend** : Vite.js, Vanilla JS, GSAP (animations), JsBarcode.
- **Backend** : Netlify Functions (Serverless Node.js).
- **APIs** : Proxy sécurisé pour Dynamics 365 et Générateur de Pass Apple Wallet.

---

## 🧩 1. Intégration Microsoft Dynamics 365

L'application communique avec Dynamics 365 via une fonction proxy (`netlify/functions/d365-proxy.js`) pour sécuriser tes identifiants.

### Étapes de configuration :
1. **Azure Portal** : Enregistre une application dans ton Azure Active Directory pour obtenir les identifiants.
2. **Permissions** : Donne les accès API "Dynamics CRM" (user_impersonation) à cette application.
3. **Netlify Environment Variables** : Ajoute les clés suivantes dans ton interface Netlify :
   - `D365_TENANT_ID` : Ton ID de locataire Azure.
   - `D365_CLIENT_ID` : L'ID de l'application enregistrée.
   - `D365_CLIENT_SECRET` : Le secret généré dans Azure.
   - `D365_RESOURCE` : L'URL de ton instance (ex: `https://org888.crm4.dynamics.com`).

### Flux de données :
- `getProfile` : Cherche le contact via son numéro de mobile.
- `updateProfile` : Met à jour les infos (Nom, Email, etc.).
- `getTickets` : Récupère l'historique des achats depuis une entité personnalisée.

---

## 🍏 2. Intégration Apple Wallet

Le design de la carte est défini dans `models/franprix.pass/pass.json`.

### Étapes de configuration :
1. **Apple Developer Portal** :
   - Crée un **Pass Type ID** (ex: `pass.com.franprix.connect`).
   - Génère un **Pass Signing Certificate** et télécharge-le.
   - Exporte le certificat au format `.p12` avec un mot de passe.
2. **Certificat WWDR** : Télécharge le certificat "Worldwide Developer Relations" d'Apple.
3. **Netlify Environment Variables** :
   - `APPLE_PASS_CERT` : Le contenu base64 de ton certificat .p12.
   - `APPLE_PASS_KEY` : Ta clé privée associée.
   - `APPLE_PASS_PASSWORD` : Le mot de passe de ton certificat.
4. **Activation** :
   - Dans `netlify/functions/apple-wallet.js`, décommente les lignes utilisant `passkit-generator`.
   - Exécute `npm install passkit-generator` sur ton environnement de build.

---

## 🛠️ 3. Mode Admin & Tests

Pour tester les différents paliers (Silver, Gold, Titanium) sans attendre les données réelles :
1. Clique sur le bouton **"Admin"** en haut à droite du header.
2. Sélectionne un palier (Silver, Gold ou Titanium).
3. L'UI se mettra à jour instantanément (couleur de la carte, cashback, verrouillage des missions).

---

## 🚀 4. Déploiement

Le projet est optimisé pour Netlify.
1. Connecte ton repo GitHub à Netlify.
2. Assure-toi que le répertoire de build est `dist`.
3. Ajoute tes variables d'environnement.
4. Déploie !

---

## 📞 Support & Réclamations
Les messages envoyés via la page "Réclamations" sont prêts à être envoyés vers une entité "Cases" ou "Feedback" de Dynamics 365.
