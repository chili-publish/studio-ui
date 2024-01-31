param (
    [Parameter(Mandatory = $True)]
    [string]$GH_Access_Token,

    # The owner and repository name
    # For example, octocat/Hello-World
    [Parameter(Mandatory = $True)]
    [string]$GH_Repository,

    # ID or file name of workflow
    [Parameter(Mandatory = $True)]
    [string]$GH_Repository_Workflow,

    # Single-line JSON string, e.g. {"name":"Mona the Octocat","home":"San Francisco, CA"}
    [Parameter(Mandatory = $True)]
    [string]$GH_Repository_Workflow_Inputs
)

try {
    $Header = @{
        'Accept'        = 'application/vnd.github+json'
        'Authorization' = "Bearer $GH_Access_Token"
    }

    $Body = @{
        ref    = "main"
        inputs = $($GH_Repository_Workflow_Inputs | ConvertFrom-Json)
    }

    Invoke-RestMethod -Uri "https://api.github.com/repos/$GH_Repository/actions/workflows/$GH_Repository_Workflow/dispatches" -Method "POST" -Body ($Body | ConvertTo-Json) -Headers $Header
}
catch {
    Write-Error "Exception: $_"
    exit -1
}

if ($? -eq $False) {
    exit $LASTEXITCODE
}