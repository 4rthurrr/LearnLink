# Script to set JWT_SECRET in Railway from Windows
# PowerShell script

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "Railway CLI detected: $railwayVersion"
}
catch {
    Write-Host "Railway CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm i -g @railway/cli"
    exit 1
}

# Generate or use provided JWT secret
if ($args.Count -eq 0) {
    # Generate a secure random JWT secret with PowerShell
    $randomBytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    $JWT_SECRET = [Convert]::ToBase64String($randomBytes)
    Write-Host "Generated JWT_SECRET: $JWT_SECRET"
}
else {
    $JWT_SECRET = $args[0]
    Write-Host "Using provided JWT_SECRET"
}

# Set the JWT_SECRET in Railway
Write-Host "Setting JWT_SECRET in Railway..." -ForegroundColor Cyan
railway variables set "JWT_SECRET=$JWT_SECRET"

Write-Host "JWT_SECRET has been set in Railway." -ForegroundColor Green
Write-Host "You can now deploy your application with: railway up"
