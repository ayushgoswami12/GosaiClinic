# MongoDB Setup for Gosai Clinic

This guide will help you set up MongoDB Atlas to store patient data across all PCs.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new project named "GosaiClinic"

## Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose the FREE tier
3. Select your preferred cloud provider and region (choose one closest to your location)
4. Click "Create Cluster" (this may take a few minutes)

## Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Create a username and password (remember these!)
4. Set privileges to "Read and write to any database"
5. Click "Add User"

## Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development purposes)
4. Click "Confirm"

## Step 5: Get Your Connection String

1. Go back to your cluster and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your database username and password

## Step 6: Update Your .env.local File

1. Open your `.env.local` file
2. Update the MONGODB_URI with your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-address>/gosaiClinic?retryWrites=true&w=majority
   ```

## Step 7: Deploy to Vercel

1. Make sure to add the MONGODB_URI as an environment variable in your Vercel project settings
2. Deploy your application

## Troubleshooting

- If you can't connect to MongoDB, check that your IP address is whitelisted
- Ensure your username and password are correct in the connection string
- Make sure you've created the database "gosaiClinic" in MongoDB Atlas

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js with MongoDB](https://www.mongodb.com/developer/languages/javascript/nextjs-with-mongodb/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)