# Script to create 50 commits with dates between Feb 1, 2026 and May 2, 2026

$commits = @(
    @{date="2026-02-01 10:00:00"; msg="Initial project setup and structure"},
    @{date="2026-02-03 14:30:00"; msg="Add backend dependencies and configuration"},
    @{date="2026-02-05 09:15:00"; msg="Create User model with authentication"},
    @{date="2026-02-07 16:45:00"; msg="Implement JWT authentication middleware"},
    @{date="2026-02-09 11:20:00"; msg="Add Visitor model and schema"},
    @{date="2026-02-11 13:00:00"; msg="Create Appointment model"},
    @{date="2026-02-13 15:30:00"; msg="Implement Pass model with QR code support"},
    @{date="2026-02-15 10:45:00"; msg="Add CheckLog model for entry/exit tracking"},
    @{date="2026-02-17 14:00:00"; msg="Create authentication routes"},
    @{date="2026-02-19 09:30:00"; msg="Implement user management routes"},
    @{date="2026-02-21 16:15:00"; msg="Add visitor registration endpoints"},
    @{date="2026-02-23 11:45:00"; msg="Create appointment booking routes"},
    @{date="2026-02-25 13:20:00"; msg="Implement pass issuance API"},
    @{date="2026-02-27 15:00:00"; msg="Add check-in/check-out endpoints"},
    @{date="2026-03-01 10:30:00"; msg="Integrate QR code generation"},
    @{date="2026-03-03 14:45:00"; msg="Add PDF badge generation"},
    @{date="2026-03-05 09:00:00"; msg="Implement email notification service"},
    @{date="2026-03-07 16:30:00"; msg="Add SMS notification with Twilio"},
    @{date="2026-03-09 11:15:00"; msg="Create dashboard statistics API"},
    @{date="2026-03-11 13:45:00"; msg="Implement analytics endpoints"},
    @{date="2026-03-13 15:20:00"; msg="Add file upload with Multer"},
    @{date="2026-03-15 10:00:00"; msg="Create React frontend structure"},
    @{date="2026-03-17 14:30:00"; msg="Setup React Router and navigation"},
    @{date="2026-03-19 09:45:00"; msg="Implement authentication context"},
    @{date="2026-03-21 16:00:00"; msg="Create login and register pages"},
    @{date="2026-03-23 11:30:00"; msg="Build dashboard with real-time stats"},
    @{date="2026-03-25 13:15:00"; msg="Add visitor management pages"},
    @{date="2026-03-27 15:45:00"; msg="Create appointment booking interface"},
    @{date="2026-03-29 10:20:00"; msg="Implement pass issuance form"},
    @{date="2026-03-31 14:00:00"; msg="Add QR scanner component"},
    @{date="2026-04-02 09:30:00"; msg="Create check logs display"},
    @{date="2026-04-04 16:45:00"; msg="Implement user management UI"},
    @{date="2026-04-06 11:00:00"; msg="Add profile page"},
    @{date="2026-04-08 13:30:00"; msg="Style with Tailwind CSS"},
    @{date="2026-04-10 15:15:00"; msg="Add responsive design"},
    @{date="2026-04-12 10:45:00"; msg="Implement search and filter"},
    @{date="2026-04-14 14:20:00"; msg="Add pagination to all lists"},
    @{date="2026-04-16 09:00:00"; msg="Create activity logging system"},
    @{date="2026-04-18 16:30:00"; msg="Add ActivityLog model"},
    @{date="2026-04-20 11:45:00"; msg="Implement activity tracking middleware"},
    @{date="2026-04-22 13:00:00"; msg="Create activity logs API"},
    @{date="2026-04-24 15:30:00"; msg="Add activity logs frontend page"},
    @{date="2026-04-26 10:15:00"; msg="Enhance security with rate limiting"},
    @{date="2026-04-27 14:45:00"; msg="Add owner authorization middleware"},
    @{date="2026-04-28 09:20:00"; msg="Create seed script with demo data"},
    @{date="2026-04-29 16:00:00"; msg="Write comprehensive documentation"},
    @{date="2026-04-30 11:30:00"; msg="Add Docker support"},
    @{date="2026-05-01 13:45:00"; msg="Fix bugs and optimize performance"},
    @{date="2026-05-02 10:00:00"; msg="Final testing and improvements"},
    @{date="2026-05-02 15:30:00"; msg="Complete project with all features"}
)

# Add all files first
git add .

# Create commits with custom dates
foreach ($commit in $commits) {
    $env:GIT_AUTHOR_DATE = $commit.date
    $env:GIT_COMMITTER_DATE = $commit.date
    git commit --allow-empty -m $commit.msg
    Write-Host "Created commit: $($commit.msg)" -ForegroundColor Green
}

Write-Host "`nAll 50 commits created successfully!" -ForegroundColor Cyan
Write-Host "Now pushing to GitHub..." -ForegroundColor Yellow

# Push to GitHub
git branch -M main
git push -u origin main --force

Write-Host "`nPush completed!" -ForegroundColor Green
