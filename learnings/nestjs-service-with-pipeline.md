# Creating a NestJS Service with CI/CD Pipeline

## Quick Summary
Set up a complete NestJS microservice with automated testing and deployment pipeline. Service includes API endpoints, unit tests, and automated deployment to AWS using GitHub Actions.

## The Problem
Need to quickly scaffold production-ready NestJS services with built-in CI/CD, so we don't have to set up pipelines from scratch every time.

## The Solution
Created a template with NestJS CLI + GitHub Actions workflow that runs tests, builds Docker image, and deploys to AWS ECS.

## Step-by-Step

1. **Initialize NestJS project**
   ```bash
   npm i -g @nestjs/cli
   nest new my-service
   cd my-service
   ```

2. **Add testing setup**
   ```bash
   npm install --save-dev @nestjs/testing
   ```

3. **Create GitHub Actions workflow**
   - Create `.github/workflows/deploy.yml`
   - Configure AWS credentials as GitHub secrets

4. **Add Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   CMD ["npm", "run", "start:prod"]
   ```

5. **Configure AWS resources with Terraform**
   - ECS cluster
   - ECR repository
   - Load balancer

## Code / Config Snippets

**GitHub Actions Pipeline:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
      - name: Build and push Docker image
        run: |
          docker build -t my-service .
          docker push $ECR_REGISTRY/my-service:latest
```

**NestJS Controller Example:**
```typescript
@Controller('api/health')
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
```

## Diagram
<!-- Add your Excalidraw architecture diagram here -->
<!-- ![NestJS Pipeline Architecture](../diagrams/nestjs-pipeline.svg) -->

## Key Learnings / Gotchas
- Always run tests before build in pipeline - saves time catching errors early
- GitHub Actions needs AWS credentials in secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- NestJS uses Jest by default - no extra config needed
- Docker image size matters - use Alpine base image
- ECS task definition needs proper health check endpoint

## Resources
- [NestJS CLI Docs](https://docs.nestjs.com/cli/overview)
- [GitHub Actions for AWS](https://github.com/aws-actions)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)

## Tags
#nestjs #pipeline #aws #ecs #github-actions #docker #terraform
