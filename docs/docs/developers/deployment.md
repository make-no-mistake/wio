---
sidebar_position: 6
title: Deployment
---

# Deployment

Wio uses GitHub Actions to automate the deployment process to a remote Virtual Private Server (VPS). We maintain separate workflows for staging and production environments to ensure code is properly tested before being deployed to live users.

## Environments

### Production
- **Trigger**: Manual dispatch (`workflow_dispatch`) from the GitHub Actions UI.
- **Workflow File**: `.github/workflows/deploy.yml`
- **Docker Project Name**: `wio-prod`
- **Port Mapping**: Default ports (e.g., Web on 3000, DB on 5432, MinIO on 9000/9001).

### Staging
- **Trigger**: Manual dispatch (`workflow_dispatch`) from the GitHub Actions UI.
- **Workflow File**: `.github/workflows/deploy-staging.yml`
- **Docker Project Name**: `wio-staging`
- **Port Mapping**: Overridden ports to avoid conflict with production.
  - Web: 3001
  - PostgreSQL: 5433
  - MinIO: 9002
  - MinIO Console: 9003

## Deployment Process

Both workflows follow a similar sequence of steps to deploy the application:

1. **Archive Source Code**: The workflow creates a `tar.gz` archive of the repository, excluding unnecessary directories like `.git` and `node_modules`.
2. **Transfer to VPS**: The archive is securely copied to the VPS via SSH. Credentials are provided through GitHub Secrets.
3. **Extraction & Setup**: 
   - The archive is extracted into the respective application directory (e.g., `~/app-prod` or `~/app-staging`).
   - Environment variables are sourced from the server's `~/envs/` directory (e.g., `.env.prod` or `.env.staging`) and copied over to the application directory as `.env`.
   - For staging, specific environment variables (like ports) are exported in the shell right before execution to override the default ports in `docker-compose.yml`.
4. **Docker Orchestration**: The application is rebuilt and restarted using `docker compose` in detached mode.

## Prerequisites for VPS

To use these workflows, the target VPS must have the following prepared:

- Docker and Docker Compose installed.
- SSH access configured, with credentials stored in GitHub repository Secrets.
- Directory `~/envs/` containing the environment files `.env.prod` and/or `.env.staging`.
