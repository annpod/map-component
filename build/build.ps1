<#
.SYNOPSIS
Build script for TeamCity.

.DESCRIPTION
Build file based on Generic Build file for Building Utility Projects and Publishing to NuGet.
It is expected to be ran in TeamCity, therefore includes specific TeamCity outputs within the script.

.PARAMETER buildNumber
The build number for this build.

.PARAMETER branchName
The name of the branch for this build.

.PARAMETER buildScript
The script file to use from CDTools to build the project.
#>
param(	
	[Parameter(Mandatory=$True)][string]$buildNumber,
	[Parameter(Mandatory=$True)][string]$branchName,	
	[Parameter(Mandatory=$False)][string]$buildScript = "Build\Npm\buildPackage.ps1",
	[Parameter(Mandatory=$True)][string]$bitbucketUser,
	[Parameter(Mandatory=$True)][string]$npmServerApiKey,
	[Parameter(Mandatory=$True)][string]$doTests,
	[Parameter(Mandatory=$False)][string]$cdtools = "master"
)

function Clone-CDTools(
    [string] $targetDirectory,
    [string] $bitbucketUser,
    [string] $branch)
{
    $repoUrl="https://$bitbucketUser@bitbucket.org/connectib/cdtools.git"

    if(Test-Path -Path $targetDirectory)
    {
        Write-Host "Remove-Item -Path $targetDirectory -Recurse -Force"
        Remove-Item -Path $targetDirectory -Recurse -Force
    }

    # Clone from repo to folder - Note here must use --quiet or git will output all non error output to stderr
    # which causes teamcity and octopus to report as warning.

    Write-Host "git clone --quiet --single-branch --branch $branch $repoUrl $targetDirectory"
    & git clone --quiet --single-branch --branch $branch $repoUrl "$targetDirectory"
}

try
{
	$targetDirectory = ".\CD\BuildTools"
	
	Write-Output "Clone-CDTools -targetDirectory $targetDirectory -bitbucketUser $bitbucketUser -branch $cdtools"   
    Clone-CDTools -targetDirectory $targetDirectory -bitbucketUser $bitbucketUser -branch $cdtools

	$buildScript = Join-Path -Path $targetDirectory -ChildPath "$buildScript"
	Write-Output "$buildScript -buildNumber $buildNumber -branchName $branchName -npmServerApiKey ******** -doTests $doTests"
	
	& "$buildScript" -buildNumber $buildNumber `
		-branchName $branchName `
		-npmServerApiKey $npmServerApiKey `
		-doTest $doTests
}
catch
{
	Write-Output "Something went wrong."
    Write-Output $_.Exception.Message
	exit -1
}