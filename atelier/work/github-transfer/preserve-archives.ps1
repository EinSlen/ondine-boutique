$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$transferRoot = 'C:\Users\Valentin\Documents\Codex\2026-08-24\repr\outputs\github-export-2026-09-13'
$manifest = Get-Content -LiteralPath (Join-Path $transferRoot 'EXPORT-MANIFEST.json') -Raw | ConvertFrom-Json
$known = @{}
foreach($item in $manifest.files){if(-not $known.ContainsKey($item.sha256)){$known[$item.sha256]=$item.path}}
$archiveReport = [System.Collections.Generic.List[object]]::new()
$secretPattern = '(?:shpat_|shpca_|shppa_|shpss_)[a-zA-Z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'
$sensitivePath = '(^|/)(\.git|node_modules|\.edge-profile[^/]*|\.venv|__pycache__|\.env[^/]*|\.mcp\.json|cookies?[^/]*|storage[-_]?state[^/]*)(/|$)|\.(pem|p12|pfx|key|log|har|sqlite|sqlite3|db)$'
$textExtensions = @('.md','.txt','.json','.js','.cjs','.mjs','.ts','.tsx','.jsx','.html','.css','.svg','.liquid','.xml','.yaml','.yml','.toml','.ini','.py','.ps1','.sh','.bat','.csv')
foreach($archive in $manifest.archives){
  $zip=[System.IO.Compression.ZipFile]::OpenRead($archive.source)
  $entries=[System.Collections.Generic.List[object]]::new()
  try{
    foreach($entry in $zip.Entries){
      if(-not $entry.Name){continue}
      $entryPath=$entry.FullName.Replace('\','/')
      if($entryPath -match $sensitivePath -or $entryPath -match '(^|/)\.\.(/|$)|^[A-Za-z]:|^/'){$entries.Add(@{entry=$entryPath;excluded='chemin sensible ou non sûr'});continue}
      if($entry.Length -ge 95MB){$entries.Add(@{entry=$entryPath;excluded='fichier supérieur à 95 Mio'});continue}
      $stream=$entry.Open();$memory=[System.IO.MemoryStream]::new()
      try{$stream.CopyTo($memory);$bytes=$memory.ToArray()}finally{$stream.Dispose();$memory.Dispose()}
      if($textExtensions -contains [System.IO.Path]::GetExtension($entryPath).ToLowerInvariant()){
        $entryText=[System.Text.Encoding]::UTF8.GetString($bytes)
        if($entryText -match $secretPattern){$entries.Add(@{entry=$entryPath;excluded='motif de secret détecté'});continue}
      }
      $hash=[Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
      if($known.ContainsKey($hash)){$repoPath=$known[$hash]}else{
        $repoPath='archives-decompressees/'+$archive.target.Substring(0,$archive.target.Length-4)+'/'+$entryPath
        $target=[System.IO.Path]::GetFullPath((Join-Path $transferRoot $repoPath))
        if(-not $target.StartsWith($transferRoot+[System.IO.Path]::DirectorySeparatorChar,[System.StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe output path'}
        [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($target)) | Out-Null
        [System.IO.File]::WriteAllBytes($target,$bytes)
        $known[$hash]=$repoPath
      }
      $entries.Add(@{entry=$entryPath;file=$repoPath;sha256=$hash;bytes=$bytes.Length})
    }
  }finally{$zip.Dispose()}
  $archiveReport.Add(@{archive=$archive.target;entries=$entries.ToArray()})
}
$archiveReport.ToArray() | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $transferRoot 'ARCHIVES-MANIFEST.json') -Encoding utf8
Write-Output ('Archives vérifiées : '+$archiveReport.Count)
Write-Output ('Contenus uniques conservés : '+$known.Count)
