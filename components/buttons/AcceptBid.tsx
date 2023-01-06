import { AcceptBidModal, useTokens } from '@reservoir0x/reservoir-kit-ui'
import { ComponentProps, FC, ReactNode, useContext } from 'react'
import { CSS } from '@stitches/react'
import { SWRResponse } from 'swr'
import { Button } from 'components/primitives'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ToastContext } from '../../context/ToastContextProvider'

type Props = {
  token?: ReturnType<typeof useTokens>['data'][0]
  bidId?: string | undefined
  collectionId?: string | undefined
  disabled?: boolean
  openState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
  buttonCss?: CSS
  buttonChildren?: ReactNode
  buttonProps?: ComponentProps<typeof Button>
  mutate?: SWRResponse['mutate']
}

const AcceptBid: FC<Props> = ({
  token,
  bidId,
  collectionId,
  disabled,
  openState,
  buttonCss,
  buttonChildren,
  buttonProps,
  mutate,
}) => {
  const { isDisconnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)

  const trigger = (
    <Button css={buttonCss} color="gray3" disabled={disabled} {...buttonProps}>
      {buttonChildren}
    </Button>
  )

  if (isDisconnected) {
    return (
      <Button
        css={buttonCss}
        onClick={() => {
          openConnectModal?.()
        }}
        color="gray3"
        {...buttonProps}
      >
        Accept Offer
      </Button>
    )
  } else
    return (
      <AcceptBidModal
        trigger={trigger}
        openState={openState}
        bidId={bidId}
        collectionId={collectionId}
        tokenId={token?.token?.tokenId}
        onClose={() => {
          if (mutate) {
            mutate()
          }
        }}
        onBidAcceptError={(error: any) => {
          if (error?.type === 'price mismatch') {
            addToast?.({
              title: 'Could not accept offer',
              description: 'Offer was lower than expected.',
            })
            return
          }
          // Handle user rejection
          if (error?.code === 4001) {
            addToast?.({
              title: 'User canceled transaction',
              description: 'You have canceled the transaction.',
            })
            return
          }
          addToast?.({
            title: 'Could not accept offer',
            description: 'The transaction was not completed.',
          })
        }}
      />
    )
}

export default AcceptBid
