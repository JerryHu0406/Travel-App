# Travel App

This project is a React application built with Vite, TypeScript, and Google Gemini AI.

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/Travel-App.git
    cd Travel-App
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    - Create a `.env.local` file in the root directory.
    - Add your Gemini API key:
      ```env
      GEMINI_API_KEY=your_api_key_here
      ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## 🛠 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Locally preview the production build.

## 📦 Deployment

This project is configured to deploy to **GitHub Pages** automatically via GitHub Actions.

1.  Push your changes to the `main` or `master` branch.
2.  Go to your repository **Settings** -> **Pages**.
3.  Under **Build and deployment**, select **GitHub Actions** as the source.
4.  The action will trigger and deploy your site.

## ⚙️ Configuration

- **Vite Config**: `vite.config.ts` is configured with `base: './'` for relative path deployment, ensuring it works on GitHub Pages subdirectories.
- **TypeScript**: `tsconfig.json` is set up for strict type checking.

## 📝 License

This project is open source.
