# Clean Git history to remove sensitive information
Write-Host "Cleaning Git history to remove sensitive OAuth credentials..." -ForegroundColor Cyan

# Create a backup branch
git branch -m shanuka shanuka-backup

# Create a new branch without the sensitive commits
git checkout --orphan temp-clean-branch
git add .
git commit -m "Clean repository - removed sensitive information"

# Delete the old branch and rename the new one
git branch -D shanuka
git branch -m temp-clean-branch shanuka

# Prepare for force push
Write-Host "Clean branch created. You will need to force push to update the remote repository." -ForegroundColor Green
Write-Host "Run this command to force push: git push -f origin shanuka" -ForegroundColor Yellow
Write-Host "WARNING: This will overwrite the history on the remote repository!" -ForegroundColor Red
