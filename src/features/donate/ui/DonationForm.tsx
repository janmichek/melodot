import {useCallback, useEffect, useState} from "react"
import {useBalance, useWriteContract} from "wagmi"
import {donateConfig} from "@/shared/config"
import {proxyPublicClient} from "@/shared/lib/rpcClient"
import {CURRENCY_SYMBOL, EXPLORER_BASE_URL, passetHub} from "@/shared/config"
import {Button} from "@/shared/ui/button"
import {Alert, AlertDescription} from "@/shared/ui/alert"
import {TxNotification} from "@/shared/ui/tx-notification"
import type {Abi} from "viem"
import {parseEther} from "viem"
import {useWeb3AuthContext} from "@/entities/contract"
import {useQueryClient} from "@tanstack/react-query"
import type {DonationFormProps, DonationTx} from "@types"
import {DonationCalculation} from "./DonationCalculation"
import {DonationAmountControls} from "./DonationAmountControls"
import {DonationArtistsControls} from "./DonationArtistsControls"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export function DonationForm({artists, onSuccess, onDiscoverAgain}: DonationFormProps) {
  // Safely handle undefined/null artists array
  const safeArtists = Array.isArray(artists) ? artists : []
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(
    new Set(safeArtists.length > 0 ? safeArtists.map(a => a.id) : [])
  )
  const [isDonating, setIsDonating] = useState(false)
  const [donationTxs, setDonationTxs] = useState<DonationTx[]>([])
  const [isAllConfirmed, setIsAllConfirmed] = useState(false)
  const [partialError, setPartialError] = useState<string | null>(null)
  const {isConnected, connect, contractAddress, address} = useWeb3AuthContext()
  const queryClient = useQueryClient()
  // Receipt polling goes through the same-origin proxy; the wallet-injected
  // RPC can be unreachable from the browser.
  const publicClient = proxyPublicClient
  const {data: balanceData, refetch: refetchBalance} = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: passetHub.id,
    query: {
      enabled: Boolean(address),
    }
  })

  const {
    writeContractAsync,
    isPending: isWriting,
    error: _writeError,
  } = useWriteContract()

  // Helper function to invalidate balance queries
  const invalidateBalance = useCallback((userAddress: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey
        if (!Array.isArray(queryKey) || queryKey[0] !== 'balance') {
          return false
        }
        const params = queryKey[1]
        if (typeof params !== 'object' || params === null || !('address' in params)) {
          return false
        }
        const queryAddress = params.address
        return (
          typeof queryAddress === 'string' &&
          queryAddress.toLowerCase() === userAddress.toLowerCase()
        )
      },
    })
  }, [queryClient])

  // Refresh the wallet balance after any confirmed donation. Only report full
  // success to the parent when every selected artist was actually paid.
  useEffect(() => {
    if (isDonating || !address || donationTxs.length === 0) {return}
    invalidateBalance(address)
    if (isAllConfirmed) {
      onSuccess?.()
    }
  }, [isDonating, isAllConfirmed, onSuccess, address, donationTxs.length, invalidateBalance])

  // Early return if no artists (after hooks)
  if (safeArtists.length === 0) {
    return null
  }

  const toggleArtist = (artistId: string) => {
    const newSelected = new Set(selectedArtists)
    if (newSelected.has(artistId)) {
      newSelected.delete(artistId)
    } else {
      newSelected.add(artistId)
    }
    setSelectedArtists(newSelected)
  }

  const donateToAll = async () => {
    if (!isConnected) {
      void connect()
      return
    }

    if (!selectedAmount || selectedArtists.size === 0 || !publicClient || safeArtists.length === 0) {return}
    if (isDonating || isWriting) {return}
    if (!contractAddress || contractAddress.toLowerCase() === ZERO_ADDRESS) {
      window.alert("The donation contract is not configured. Please contact the platform operator.")
      return
    }

    try {
      // Make sure we have the latest balance before checking
      const refreshedBalance = address ? await refetchBalance() : undefined

      // Check user balance before attempting donations
      const selectedCount = selectedArtists.size
      const totalDonationAmount = selectedAmount * selectedCount
      const requiredWei = parseEther(String(totalDonationAmount))
      const currentBalance = refreshedBalance?.data?.value ?? balanceData?.value ?? 0n
      if (currentBalance < requiredWei) {
        window.alert("Insufficient funds for this donation amount.")
        return
      }

      setIsDonating(true)
      setIsAllConfirmed(false)
      setPartialError(null)
      setDonationTxs([])
      const txs: DonationTx[] = []
      const failedArtists: string[] = []
      
      // Create a map for quick artist name lookup
      const artistMap = new Map(safeArtists.map(a => [a.id, a.name]))
      
      // Donate to each selected artist sequentially
      for (const artistId of selectedArtists) {
        try {
          // Write contract and get hash
          const hash = await writeContractAsync({
            chainId: passetHub.id,
            account: address as `0x${string}` | undefined,
            address: contractAddress,
            abi: donateConfig.abi as Abi,
            functionName: "donateToArtist",
            args: [String(artistId)],
            value: parseEther(String(selectedAmount)),
          })
          
          // Wait for transaction to be confirmed
          await publicClient.waitForTransactionReceipt({
            hash,
          })
          
          // Only add transaction to list after it's confirmed (successful)
          const tx: DonationTx = {
            hash,
            artistId,
            artistName: artistMap.get(artistId) || artistId,
            isConfirmed: true,
          }
          txs.push(tx)
          setDonationTxs([...txs])
          
        } catch (err) {
          console.error(`Error donating to artist ${artistId}:`, err)
          failedArtists.push(artistMap.get(artistId) || artistId)
          // Continue with other artists even if one fails
        }
      }
      
      // Only show the success state when every selected artist was paid.
      const allTxsConfirmed =
        txs.length === selectedArtists.size && failedArtists.length === 0
      setIsAllConfirmed(allTxsConfirmed)
      if (!allTxsConfirmed) {
        setPartialError(
          `Donated to ${txs.length} of ${selectedArtists.size} artists. ` +
          `Failed: ${failedArtists.join(", ")}. You can retry the failed ones.`,
        )
        // Drop the artists that were already paid so a retry cannot double-pay.
        setSelectedArtists((previous) => {
          const remaining = new Set(previous)
          for (const tx of txs) {
            remaining.delete(tx.artistId)
          }
          return remaining
        })
      }
      
    } catch (err) {
      console.error("Error during donation process:", err)
    } finally {
      setIsDonating(false)
    }
  }

  const selectedCount = selectedArtists.size
  const totalDonation = selectedAmount && selectedCount > 0 ? selectedAmount * selectedCount : 0
  const confirmedCount = donationTxs.length
  const confirmedTotal = selectedAmount ? selectedAmount * confirmedCount : 0

  return (
    <div className="space-y-4">
      {!(isDonating || isWriting || isAllConfirmed) && (
        <>
          <DonationArtistsControls
            artists={safeArtists}
            selectedArtists={selectedArtists}
            onToggleArtist={toggleArtist}
            isDisabled={isDonating || isWriting}/>

          <DonationAmountControls
            selectedAmount={selectedAmount}
            onAmountChange={setSelectedAmount}/>
        </>
      )}

      <DonationCalculation
        selectedAmount={selectedAmount}
        selectedCount={selectedCount}
        totalDonation={totalDonation}
        isDonating={isDonating}
        isWriting={isWriting}
        isAllConfirmed={isAllConfirmed}
        isConnected={isConnected}
        onDonate={donateToAll}/>

      {partialError && (
        <Alert variant="destructive">
          <AlertDescription>{partialError}</AlertDescription>
        </Alert>
      )}

      {(isDonating || isWriting) && (
        <TxNotification
          isProcessing={true}
          title="Please wait, processing donations..."
          processingMessage="Processing donation"
          progress={{
            confirmed: donationTxs.filter(tx => tx.isConfirmed).length,
            total: selectedCount,
          }}
          transactions={[]}
          blockExplorerBaseUrl={EXPLORER_BASE_URL}
          autoHideSuccess={false}/>
      )}

      {isAllConfirmed && donationTxs.length > 0 && (
        <>
          <TxNotification
            isSuccess={true}
            title={`Donated ${confirmedTotal} ${CURRENCY_SYMBOL} to ${confirmedCount} artist${confirmedCount === 1 ? '' : 's'}!`}
            transactions={donationTxs.map(tx => ({
              hash: tx.hash,
              label: tx.artistName,
            }))}
            blockExplorerBaseUrl={EXPLORER_BASE_URL}
            autoHideSuccess={false}/>

          {onDiscoverAgain && (
            <Button
              onClick={onDiscoverAgain}
              variant="ghost"
              size="lg"
              className="w-full mt-4">
              ← Discover again
            </Button>
          )}
        </>
      )}
    </div>
  )
}
