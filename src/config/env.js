const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing ENV variable: ${key}`);
    process.exit(1);
  }
});

console.log("✅ Environment variables validated");
FRONTEND_URL=http://localhost:5173
