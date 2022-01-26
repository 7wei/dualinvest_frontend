import { Box, Typography } from '@mui/material'
import Card from 'components/Card/Card'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import BlueRing from 'components/Icon/BlueRing'
import { CURRENCIES } from 'constants/currencies'
import useBreakpoint from 'hooks/useBreakpoint'
import { usePrice } from 'hooks/usePriceSet'

interface Props {
  logoCurSymbol: string
  title: string | JSX.Element
  priceCurSymbol: string
  description?: string
}

export default function ProductCardHeader(props: Props) {
  const { logoCurSymbol, title, priceCurSymbol, description } = props

  const curPrice = usePrice(priceCurSymbol)

  const isDownSm = useBreakpoint('sm')
  const isDownMd = useBreakpoint('md')

  return (
    <Box
      display={{ xs: 'grid', sm: 'flex' }}
      alignContent="center"
      justifyContent={{ xs: 'stretch', sm: 'space-between' }}
      gap={{ xs: '0', sm: '40px' }}
    >
      <Box display="grid" columnGap={20} mb={{ xs: 10, md: 0 }}>
        <CurrencyLogo
          currency={CURRENCIES[logoCurSymbol]}
          size="64px"
          style={{
            gridRowStart: 1,
            gridRowEnd: isDownSm ? 'span 1' : 'span 2',
            marginBottom: isDownSm ? 12 : 0
          }}
        />

        <Typography
          fontWeight={700}
          align="left"
          sx={{
            gridColumnStart: isDownSm ? 1 : 2,
            gridColumnEnd: 'span 1',
            fontSize: 24
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography fontSize={16} sx={{ opacity: 0.5 }} align="left">
            {description}
          </Typography>
        )}
      </Box>
      <Card gray={isDownSm} style={{ borderRadius: '16px', margin: isDownMd ? '16px 0' : 0 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems={isDownMd ? 'flex-start' : 'flex-end'}
          padding={{ xs: '16px', sm: '16px 0' }}
          gap={isDownMd ? 10 : 0}
        >
          <Typography color="primary" fontSize={24} fontWeight={700} gap={8} display="flex" alignItems="center">
            <span style={{ width: 120 }}>
              {' '}
              {curPrice
                ? (+curPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '-'}
            </span>
            <BlueRing />
          </Typography>
          <Typography fontSize={16} sx={{ color: theme => theme.palette.text.secondary }}>
            {priceCurSymbol} latest spot price
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}