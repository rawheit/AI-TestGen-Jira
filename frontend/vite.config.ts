import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as dotenv from 'dotenv';


dotenv.config(); // Load environment variables from .env file

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
