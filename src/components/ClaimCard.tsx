import {useEffect, useMemo, useState} from "react"
import {useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi"
import {donateConfig} from "@/generated"
import type {Abi} from "viem"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Check, Copy, ExternalLink, X} from "lucide-react"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {ArtistPayoutForm} from "@/components/ArtistPayoutForm"
import {ArtistCard} from "@/components/ArtistCard"
import {Spinner} from "@/components/ui/spinner"
import {Stepper} from "@/components/ui/stepper"
import {TxNotification} from "@/components/ui/tx-notification"
import {EXPLORER_BASE_URL} from "@/wagmi-config"
import {getErrorMessage} from "@/lib/utils"
import type {ArtistData, ClaimCardProps, Step, VerifyResponse} from "@types"

function parseArtistIdFromUrl(url: string): string | null {
  const match = url.match(/artist\/([a-zA-Z0-9]+)/)
  return match?.[1] || null
}

function isArtistInfoTuple(data: unknown): data is [bigint, boolean] {
  return Array.isArray(data) &&
         data.length === 2 &&
         typeof data[0] === 'bigint' &&
         typeof data[1] === 'boolean'
}

export function ClaimCard({contractAddress}: ClaimCardProps) {
  
  // Artist identification
  const [artistUrl, setArtistUrl] = useState('')
  const [artistData, setArtistData] = useState<ArtistData | null>(null)
  const [isLoadingArtist, setIsLoadingArtist] = useState(false)
  
  // Claim state
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCodeCopied, setIsCodeCopied] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>()
  const [demoClaimTxHash, setDemoClaimTxHash] = useState<string | undefined>()

  // Parse artist ID from URL
  const parsedArtistId = useMemo(() => parseArtistIdFromUrl(artistUrl), [artistUrl])

  // Wagmi hooks
  const {writeContract, isPending: isClaimPending} = useWriteContract()
  const {isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError} = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
    query: {refetchInterval: (query) => query.state.status === 'pending' ? 2000 : false},
  })

  // Wagmi hooks for demo claim
  const {writeContract: demoWriteContract, isPending: isDemoClaimPending} = useWriteContract()
  const {
    isLoading: isDemoConfirming,
    isSuccess: isDemoConfirmed,
  } = useWaitForTransactionReceipt({
    hash: demoClaimTxHash as `0x${string}` | undefined,
  })

  // Fetch artist data and reset state when artist ID changes
  useEffect(() => {
    if (!parsedArtistId) {
      setArtistData(null)
      return
    }

    setError(null)
    setIsLoadingArtist(true)
    
    fetch(`/api/artist?artistUrl=${encodeURIComponent(artistUrl.trim())}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch artist'))
      .then(setArtistData)
      .catch(err => {
        console.error('Error fetching artist:', err)
        setArtistData(null)
      })
      .finally(() => setIsLoadingArtist(false))
  }, [parsedArtistId, artistUrl])

  // Auto-hide copy confirmation
  useEffect(() => {
    if (!isCodeCopied) {return}
    const timer = setTimeout(() => setIsCodeCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [isCodeCopied])

  // Read artist info from contract
  const {data: artistInfoData, refetch} = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'getArtistInfo',
    args: parsedArtistId ? [parsedArtistId] : undefined,
    query: {
      enabled: !!contractAddress && !!parsedArtistId,
      refetchInterval: (query) => {
        if (query.state?.data) {
          const [, isClaimed] = query.state.data as [bigint, boolean]
          return isClaimed ? false : 2000
        }
        return false
      },
    },
  })

  // Parse contract data with type safety
  const artistBalance = isArtistInfoTuple(artistInfoData) ? artistInfoData[0] : null
  const isArtistClaimed = isArtistInfoTuple(artistInfoData) ? artistInfoData[1] : false
  const isProcessing = isVerifying || isClaimPending || isConfirming

  // Handlers
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(import.meta.env.VITE_VERIFICATION_CODE)
      setIsCodeCopied(true)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleReset = () => {
    setArtistUrl('')
    setArtistData(null)
    setError(null)
    setTxHash(undefined)
  }

  const handleVerify = async (): Promise<boolean> => {
    if (!parsedArtistId) {return false}

    setError(null)
    setIsVerifying(true)

    try {
      const res = await fetch(`/api/verify?artistId=${encodeURIComponent(parsedArtistId)}`)
      const data = await res.json() as VerifyResponse | {error: string}
      
      if (!res.ok || !('verified' in data) || !data.verified) {
        const code = import.meta.env.VITE_VERIFICATION_CODE
        setError('error' in data ? data.error : `Add ${code} to your Spotify bio and try again`)
        return false
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClaim = async () => {
    if (!parsedArtistId || !contractAddress) {
      setError('Valid Spotify artist URL is required')
      return
    }

    setError(null)
    setTxHash(undefined)

    try {
      // Verify artist identity before claiming
      setIsVerifying(true)
      const verified = await handleVerify()
      setIsVerifying(false)
      if (!verified) {return}

      // Claim artist
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'claimArtist',
        args: [parsedArtistId],
      }, {
        onSuccess: (hash) => setTxHash(hash)
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to claim artist'))
      setIsVerifying(false)
    }
  }

  /**
   * TEMPORARY/DEMO: Fake claiming demo mechanism
   * This bypasses bio verification and directly claims the artist
   * This is only for demo purposes and should be removed before production
   * TODO: Remove this function before production deployment
   */
  const handleDemoVerify = async () => {
    if (!parsedArtistId) {
      setError('Please paste a Spotify artist URL first')
      return
    }

    if (!contractAddress) {
      setError('Contract address not available')
      return
    }

    // Clear any previous errors
    setError(null)
    setDemoClaimTxHash(undefined)

    try {
      // Directly claim the artist without bio verification
      demoWriteContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'claimArtist',
        args: [parsedArtistId],
      }, {
        onSuccess: (hash) => setDemoClaimTxHash(hash)
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to claim artist'))
    }
  }

  // Refetch artist info after successful claim
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => void refetch(), 500)
    }
  }, [isConfirmed, refetch])

  // Handle successful demo claim
  useEffect(() => {
    if (isDemoConfirmed) {
      setTimeout(() => void refetch(), 500)
      setDemoClaimTxHash(undefined)
    }
  }, [isDemoConfirmed, refetch])

  // Build steps for UI
  const hasValidUrl = !!parsedArtistId
  const hasBalance = artistBalance !== null && artistBalance > 0n
  
  const steps: Step[] = [
    {
      number: 1,
      title: "Identify",
      description: "Enter your Spotify artist profile URL to get started",
      status: hasValidUrl ? "completed" : "active",
      content: !hasValidUrl ? (
        <Input
          type="text"
          placeholder="https://open.spotify.com/artist/..."
          value={artistUrl}
          onChange={(e) => setArtistUrl(e.target.value)}/>
      ) : (
        <div className="relative">
          {!isArtistClaimed && (
            <button
              onClick={handleReset}
              className="absolute -top-2 -right-2 z-10 rounded-full bg-muted p-1.5 hover:bg-muted/80 transition-colors border border-border"
              title="Reset">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {artistBalance === null ? (
            <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm"/>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </div>
          ) : hasBalance && artistBalance !== null ? (
            <ArtistCard
              artistBalance={artistBalance}
              isArtistClaimed={isArtistClaimed}
              contractAddress={contractAddress}
              artistData={artistData}
              isLoadingArtist={isLoadingArtist}/>
          ) : (
            <div className="rounded-lg border border-border/40 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
              Not found
            </div>
          )}
        </div>
      ),
    },
    {
      number: 2,
      title: "Claim",
      description: "Click Claim to verify your identity and claim ownership of your artist donations",
      status: !hasValidUrl ? "disabled" : isArtistClaimed ? "completed" : "active",
      content: hasValidUrl && !isArtistClaimed ? (
        <div className="space-y-4">
          {!isProcessing && (
            <>
              <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Verification Instructions</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>
                    Copy this code:{' '}
                    <code className="px-2 py-1 rounded bg-background border border-border font-mono text-foreground">
                      {import.meta.env.VITE_VERIFICATION_CODE}
                    </code>
                    {' '}
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors">
                      {isCodeCopied ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                    </button>
                  </li>
                  <li>
                    Go to your{' '}
                    <a
                      href={`https://artists.spotify.com/c/artist/${parsedArtistId}/profile/about`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1">
                      Spotify artist profile
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                  <li>Paste the code to your artist bio's about section</li>
                  <li>Come back and click 'Claim' below</li>
                </ol>
              </div>
              
              <Button onClick={handleClaim} className="w-full">
                Claim
              </Button>

              {/* TEMPORARY/DEMO: Demo claim button - bypasses verification */}
              {/* This button skips the bio verification step for demo purposes */}
              {/* TODO: Remove this button before production deployment */}
              <Button
                onClick={handleDemoVerify}
                disabled={isDemoClaimPending || isDemoConfirming || !parsedArtistId}
                variant="secondary"
                className="w-full">
                {isDemoClaimPending || isDemoConfirming ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {isDemoClaimPending ? 'Claiming...' : 'Confirming...'}
                  </>
                ) : (
                  'Demo (fake) claim'
                )}
              </Button>
            </>
          )}

          <TxNotification
            hash={txHash}
            isLoading={isClaimPending}
            isSuccess={isConfirmed}
            isError={!!(confirmError?.message || error)}
            isProcessing={isProcessing}
            error={confirmError?.message || error || undefined}
            title="Claim Status"
            successMessage="Successfully claimed! You can now payout your balance."
            pendingMessage="Waiting for confirmation..."
            errorMessage="Claim failed"
            processingMessage={
              isVerifying ? 'Verifying your artist bio...' :
              isClaimPending ? 'Sending transaction...' :
              isConfirming ? 'Confirming...' : 'Processing...'
            }
            blockExplorerBaseUrl={EXPLORER_BASE_URL}
            autoHideSuccess={false}/>

          {/* Demo claim transaction notification */}
          {demoClaimTxHash && (
            <TxNotification
              hash={demoClaimTxHash}
              isLoading={isDemoClaimPending}
              isSuccess={isDemoConfirmed}
              isError={false}
              isProcessing={isDemoClaimPending || isDemoConfirming}
              title="Demo Claim Status"
              successMessage="Successfully claimed! You can now payout your balance."
              pendingMessage="Waiting for confirmation..."
              errorMessage="Claim failed"
              processingMessage={isDemoClaimPending ? 'Sending transaction...' : 'Waiting for confirmation...'}
              blockExplorerBaseUrl={EXPLORER_BASE_URL}
              autoHideSuccess={false}/>
          )}
        </div>
      ) : isArtistClaimed ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500"/>
            <span className="text-sm font-semibold text-emerald-600">
              Successfully claimed! You can now payout your balance.
            </span>
          </div>
        </div>
      ) : undefined,
    },
    {
      number: 3,
      title: "Payout",
      description: "Send your claimed reward to a wallet address",
      status: !hasValidUrl || !isArtistClaimed ? "disabled" : "active",
      content: hasValidUrl && isArtistClaimed && contractAddress && artistBalance !== null ? (
        <ArtistPayoutForm
          contractAddress={contractAddress}
          artistId={parsedArtistId || ""}
          artistBalance={artistBalance}
          onPayoutSuccess={() => void refetch()}/>
      ) : undefined,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim guide</CardTitle>
        <CardDescription>
          Follow these steps to verify your identity and claim your donations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Stepper steps={steps} isProcessing={isVerifying} processingStepNumber={2}/>
      </CardContent>
    </Card>
  )
}
