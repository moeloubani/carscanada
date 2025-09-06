# Railway Deployment Issue: Next.js Default Page Instead of Custom App

## Issue Summary
The CarsCanada web application was showing the default Next.js page instead of the custom application when deployed to Railway. The deployment was failing due to configuration and structural issues in the monorepo setup.

## Investigation Steps
1. Checked Railway service configuration for project ID `54c86933-b1bd-4b6c-8b98-02d9c4ddd39d`
2. Reviewed deployment logs for failed deployment `cf49e691-d9b4-4bb2-aec4-47f9a3d018cf`
3. Analyzed project structure to understand monorepo configuration
4. Examined app directory structure and identified dual app directories issue
5. Tested build process locally to identify missing dependencies

## Findings

### 1. **Dual App Directory Structure**
- **Problem**: The Next.js app had two app directories:
  - `/apps/web/app/` - containing auth pages (login, register, dashboard, etc.)
  - `/apps/web/src/app/` - containing main pages (home, listings, layout)
- **Impact**: Next.js was unable to properly resolve the routing structure, causing build failures

### 2. **Incorrect Build Configuration**
- **Initial Configuration**:
  - Root Directory: `apps/web`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run start`
- **Issue**: Did not properly handle monorepo structure with workspaces

### 3. **Missing UI Component Dependencies**
- **Missing npm packages**:
  - `@radix-ui/react-icons`
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-alert-dialog`
  - `@radix-ui/react-progress`
  - `@radix-ui/react-scroll-area`
  - `@radix-ui/react-separator`
  - `@radix-ui/react-switch`
  - `@radix-ui/react-toast`

- **Missing component files**:
  - `/src/components/ui/alert.tsx`
  - `/src/components/ui/checkbox.tsx`
  - `/src/components/ui/alert-dialog.tsx`
  - `/src/components/ui/progress.tsx`
  - `/src/components/ui/scroll-area.tsx`
  - `/src/components/ui/separator.tsx`
  - `/src/components/ui/switch.tsx`
  - `/src/components/ui/table.tsx`
  - `/src/hooks/use-toast.tsx`

### 4. **PORT Variable Configuration Error**
- **Problem**: Initially set PORT variable incorrectly as `${{PORT}}`
- **Impact**: Deployment failed with "PORT variable must be integer between 0 and 65535"

## Root Cause
The primary root cause was the split app directory structure causing Next.js routing confusion, combined with missing UI component dependencies that prevented successful builds.

## Resolution Steps

### Completed Actions:
1. **Consolidated App Structure**:
   - Moved all pages from `/apps/web/app/` to `/apps/web/src/app/`
   - Removed empty `/apps/web/app/` directory
   
2. **Updated Railway Configuration**:
   - Root Directory: `/`
   - Build Command: `npm install && npm run build --workspace=@carscanada/web`
   - Start Command: `npm run start --workspace=@carscanada/web`

3. **Fixed PORT Variable**:
   - Removed incorrectly configured PORT variable

4. **Installed Missing Dependencies**:
   - Added all missing Radix UI packages

5. **Created Missing Components**:
   - Created `alert.tsx` component
   - Created `checkbox.tsx` component

### Remaining Actions Required:
1. **Create remaining UI components**:
   - alert-dialog.tsx
   - progress.tsx
   - scroll-area.tsx
   - separator.tsx
   - switch.tsx
   - table.tsx

2. **Create use-toast hook**:
   - /src/hooks/use-toast.tsx

3. **Commit changes to repository**:
   - All structure changes
   - New dependencies in package.json
   - New component files

4. **Trigger new deployment** after completing above steps

## Prevention Recommendations

1. **Standardize Project Structure**:
   - Always use single app directory (`src/app`) for Next.js apps
   - Document project structure in README

2. **Component Library Setup**:
   - Use a component generation tool like `shadcn/ui` CLI
   - Maintain a checklist of required UI components
   - Include all component dependencies in initial setup

3. **Monorepo Build Configuration**:
   - Use workspace-aware commands for monorepo deployments
   - Test builds locally before deploying
   - Document Railway-specific configuration requirements

4. **Deployment Checklist**:
   - Verify all dependencies are installed
   - Test build locally with production settings
   - Check for console errors in build output
   - Ensure environment variables are properly configured

5. **Version Control Best Practices**:
   - Commit all UI components to repository
   - Include package-lock.json for consistent dependencies
   - Use CI/CD pipeline to catch build issues early

## Technical Details

### Working Configuration:
```json
{
  "rootDirectory": "/",
  "buildCommand": "npm install && npm run build --workspace=@carscanada/web",
  "startCommand": "npm run start --workspace=@carscanada/web",
  "region": "us-east4"
}
```

### Project Structure (Fixed):
```
/apps/web/
  ├── src/
  │   ├── app/           # All pages consolidated here
  │   │   ├── page.tsx   # Homepage
  │   │   ├── layout.tsx # Root layout
  │   │   ├── dashboard/ # Dashboard pages
  │   │   ├── login/     # Auth pages
  │   │   └── listings/  # Listing pages
  │   └── components/    # Shared components
  └── package.json       # Web app dependencies
```

## Status
The deployment infrastructure issues have been identified and partially resolved. The remaining task is to complete the missing UI components and commit all changes before triggering a final deployment.