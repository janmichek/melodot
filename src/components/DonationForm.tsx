import {useCallback, useEffect, useState} from "react"
import {useBalance, usePublicClient, useWriteContract} from "wagmi"
import {donateConfig} from "@/generated"
import {CURRENCY_SYMBOL, EXPLORER_BASE_URL, polkadotTestnet} from "@/wagmi-config"
import {Button} from "@/components/ui/button"
import {TxNotification} from "@/components/ui/tx-notification"
import type {Abi} from "viem"
import {parseEther} from "viem"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import {useQueryClient} from "@tanstack/react-query"
import type {DonationFormProps, DonationTx} from "@types"
import {DonationCalculation} from "@/components/DonationCalculation"
import {DonationAmountControls} from "@/components/DonationAmountControls"
import {DonationArtistsControls} from "@/components/DonationArtistsControls"

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
  const {isConnected, connect, contractAddress, address} = useWeb3AuthContext()
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const {data: balanceData, refetch: refetchBalance} = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: polkadotTestnet.id,
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

  // Call onSuccess callback and refetch balance when all transactions are confirmed
  useEffect(() => {
    if (isAllConfirmed && address && donationTxs.length > 0) {
      invalidateBalance(address)
      onSuccess?.()
    }
  }, [isAllConfirmed, onSuccess, queryClient, address, donationTxs.length, invalidateBalance])

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

    try {
      // Make sure we have the latest balance before checking
      if (address) {
        await refetchBalance()
      }

      // Check user balance before attempting donations
      const selectedCount = selectedArtists.size
      const totalDonationAmount = selectedAmount * selectedCount
      const requiredWei = parseEther(String(totalDonationAmount))
      const currentBalance = balanceData?.value ?? 0n
      if (currentBalance < requiredWei) {
        window.alert("Insufficient funds for this donation amount.")
        return
      }

      setIsDonating(true)
      setIsAllConfirmed(false)
      const txs: DonationTx[] = []
      
      // Create a map for quick artist name lookup
      const artistMap = new Map(safeArtists.map(a => [a.id, a.name]))
      
      // Donate to each selected artist sequentially
      for (const artistId of selectedArtists) {
        try {
          // Write contract and get hash
          const hash = await writeContractAsync({
            chainId: polkadotTestnet.id,
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
          // Continue with other artists even if one fails
        }
      }
      
      // Check if all transactions are confirmed
      const allTxsConfirmed = txs.every(tx => tx.isConfirmed)
      setIsAllConfirmed(allTxsConfirmed)
      
    } catch (err) {
      console.error("Error during donation process:", err)
    } finally {
      setIsDonating(false)
    }
  }

  const selectedCount = selectedArtists.size
  const totalDonation = selectedAmount && selectedCount > 0 ? selectedAmount * selectedCount : 0

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
            title={`Donated ${totalDonation} ${CURRENCY_SYMBOL} to ${selectedCount} artist${selectedCount > 1 ? 's' : ''}!`}
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
