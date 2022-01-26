import { Box, Typography } from '@mui/material'
import NumericalCard from 'components/Card/NumericalCard'
import ProductCardHeader from 'components/ProductCardHeader'
import Divider from 'components/Divider'
import { Timer } from 'components/Timer'
import Button from 'components/Button/Button'
import { OutlinedCard } from 'components/Card/Card'
import { RecurProduct } from 'utils/fetch/recur'
import Spinner from 'components/Spinner'
import dayjs from 'dayjs'

export default function VaultProductCard({
  logoCurSymbol,
  priceCurSymbol,
  title,
  description,
  deposit,
  onClick,
  color,
  product
}: {
  logoCurSymbol: string
  priceCurSymbol: string
  title: string
  description: string
  deposit: string
  onClick: () => void
  color: string
  product: RecurProduct | undefined
}) {
  return (
    <Box
      display="grid"
      width="100%"
      gap={32}
      margin={{ xs: '0px 20px' }}
      sx={{
        border: '1px solid transparent',
        background: theme => theme.palette.background.paper,
        borderRadius: 2,
        padding: '34px 24px',
        maxWidth: theme => ({ xs: `calc(100% - 40px)`, md: theme.width.maxContent })
      }}
    >
      <ProductCardHeader
        logoCurSymbol={logoCurSymbol}
        description={description}
        title={title}
        priceCurSymbol={priceCurSymbol}
      />
      <Divider color="#cccccc10" extension={25} />

      {product ? (
        <Box display={{ xs: 'grid' }} gap={24} gridTemplateColumns={{ xs: '100%', md: '35% auto' }}>
          <NumericalCard value={product?.apy ?? '-'} subValue="Current APY" border valueColor={color} />
          <NumericalCard value={deposit} subValue="Your existing position" border>
            <Button
              style={{ borderRadius: 40 }}
              width={'132px'}
              height="36px"
              backgroundColor={color}
              onClick={onClick}
            >
              Add
            </Button>
          </NumericalCard>
          <NumericalCard value={product.strikePrice + ' USDT'} subValue="Current Strike Price" border />
          <NumericalCard
            value={<Timer timer={product?.expiredAt ?? 0} />}
            subValue="Countdown until delivery date"
            gray
          >
            <OutlinedCard color="rgba(0, 0, 0, 0.1)">
              <Box display="grid" padding="14px 18px" gap={4} height={60} minWidth={248}>
                <Typography sx={{ color: theme => theme.palette.text.secondary }} fontSize={12} textAlign={'left'}>
                  Delivery Date
                </Typography>
                <Typography fontSize={12}>
                  {product?.expiredAt ? dayjs(product.expiredAt).format('MMM DD,YYYY') + ' 08:30 AM UTC' : '-'}
                </Typography>
              </Box>
            </OutlinedCard>
          </NumericalCard>
        </Box>
      ) : (
        <Box margin={'60px auto'}>
          <Spinner size={60} />
        </Box>
      )}
    </Box>
  )
}