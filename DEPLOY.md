# Flash Card App Deployment Guide

This document provides instructions for deploying the Flash Card application on Render.

## Prerequisites

- A [Render](https://render.com) account
- Git repository with your Flash Card application code

## Deployment Process

1. **Login to Render**

   Visit [render.com](https://render.com) and log in to your account.

2. **Create a New Blueprint**

   - Click on the "New +" button in the top right corner
   - Select "Blueprint" from the dropdown menu
   - Connect your GitHub repository containing the Flash Card application

3. **Configure the Blueprint**

   - Render will automatically detect the `render.yaml` file in your repository
   - Review the services that will be created:
     - `flashcard-api`: Backend Node.js API
     - `flashcard-web`: Frontend Node.js application
     - `flashcard-db`: PostgreSQL database

4. **Set Environment Variables**

   The `render.yaml` file already specifies most environment variables, but you should set the following:

   - For the `flashcard-api` service:
     - `JWT_SECRET`: A secure random string for JWT token signing

5. **Deploy the Blueprint**

   - Click "Apply Blueprint" to start the deployment process
   - Render will create all the services defined in the `render.yaml` file
   - Wait for all services to complete the build and deployment process

6. **Access Your Application**

   - Once deployment is complete, you can access your application via the URL provided by Render
   - The frontend will be available at `https://flashcard-web.onrender.com`
   - The API will be available at `https://flashcard-api.onrender.com`

## Troubleshooting

- **Database Connection Issues**: Check that the database environment variables are correctly set and the database service is running.
- **CORS Errors**: Verify that the `FRONTEND_URL` environment variable is correctly set in the backend service.
- **Build Failures**: Review the build logs for any errors and fix issues in your code.

## Updating Your Deployment

When you push changes to your repository, Render will automatically rebuild and redeploy your services if you've enabled auto-deploy.

## Monitoring

You can monitor your application's performance, logs, and resource usage through the Render dashboard.
