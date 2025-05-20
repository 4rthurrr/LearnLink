# Instructions for using BFG Repo-Cleaner to remove sensitive data

# Step 1: Download BFG Repo-Cleaner
Write-Host "Please download BFG Repo-Cleaner from: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Cyan
Write-Host "Save the jar file to a location on your computer." -ForegroundColor Cyan

# Step 2: Create a text file with patterns to replace
Write-Host "Creating a patterns file for BFG..." -ForegroundColor Cyan
@"
# OAuth Client ID
CLIENT_ID_PATTERN_HERE=YOUR_GOOGLE_CLIENT_ID_HERE
# OAuth Client Secret
CLIENT_SECRET_PATTERN_HERE=YOUR_GOOGLE_CLIENT_SECRET_HERE
"@ | Out-File -FilePath "sensitive-patterns.txt" -Encoding utf8

# Step 3: Run BFG command
Write-Host "To clean your repository with BFG, run this command:" -ForegroundColor Yellow
Write-Host "java -jar path\to\bfg.jar --replace-text sensitive-patterns.txt ." -ForegroundColor Yellow

# Step 4: After BFG has done its work
Write-Host "After running BFG, execute these commands:" -ForegroundColor Yellow
Write-Host "git reflog expire --expire=now --all" -ForegroundColor Yellow
Write-Host "git gc --prune=now --aggressive" -ForegroundColor Yellow
Write-Host "git push -f origin shanuka" -ForegroundColor Yellow

Write-Host "WARNING: This will modify your Git history and requires a force push." -ForegroundColor Red
