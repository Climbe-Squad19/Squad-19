param(
    [string]$ApiBaseUrl = "http://localhost:8081",
    [Parameter(Mandatory = $true)]
    [string]$JwtToken,
    [int]$DiasRetroativos = 14
)

$uri = "$ApiBaseUrl/reunioes/meet/sync-gravacoes?diasRetroativos=$DiasRetroativos"
$headers = @{
    "Authorization" = "Bearer $JwtToken"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers
    Write-Output "Sync concluído: $($response.reunioesAtualizadas) reunião(ões) atualizada(s)"
    Write-Output "Janela: $($response.diasRetroativos) dia(s)"
    exit 0
} catch {
    Write-Error "Falha ao sincronizar gravações do Meet: $($_.Exception.Message)"
    exit 1
}
